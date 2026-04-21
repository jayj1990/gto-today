//! WASM bindings for the postflop-solver Rust crate.
//!
//! Exposed as a single `solve_flop` entry point that takes a JSON
//! config + ranges and returns the root-node strategy as JSON. The
//! gto.today Next.js app calls this from a Vercel Function so we
//! stay within the AGPL terms — this crate is MIT-incompatible and
//! must live in a public AGPL repo; the main app links via HTTP
//! only (mere aggregation).

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use postflop_solver::{
    ActionTree, BetSizeOptions, BoardState, CardConfig, PostFlopGame, TreeConfig, solve,
};

#[derive(Debug, Deserialize)]
pub struct SolveInput {
    /// Three flop cards, e.g. ["As","Kh","7d"].
    pub board: [String; 3],
    /// Pio-style range strings.
    pub oop_range: String,
    pub ip_range: String,
    /// Pot in BB at flop. MTT uses ~6.5 (ante baked in), cash ~5.5.
    pub pot: f32,
    /// Effective stack in BB (min of both players' remaining).
    pub eff_stack: f32,
    /// Target exploitability in percent. Lower = more accurate, slower.
    /// Default 0.5 (≈ GTO Wizard 'fast' preset).
    #[serde(default = "default_accuracy")]
    pub accuracy: f32,
    /// Hard iteration cap so runaway solves can't exceed the Vercel
    /// Function timeout.
    #[serde(default = "default_max_iter")]
    pub max_iter: u32,
}

fn default_accuracy() -> f32 {
    0.5
}
fn default_max_iter() -> u32 {
    150
}

#[derive(Debug, Serialize)]
pub struct SolveOutput {
    /// Action labels at root ('check', 'bet33', 'bet75').
    pub actions: Vec<String>,
    /// Per-combo frequency distribution at root. Sums ~1.0 per combo.
    pub mix: std::collections::HashMap<String, Vec<f32>>,
    pub exploitability: f32,
    pub iterations: u32,
}

/// Entry point called from Node via wasm-bindgen. Takes/returns
/// JsValue so the JS side just serialises/deserialises with serde.
///
/// Wraps the body in `catch_unwind` so Rust panics surface as JS
/// errors with the actual panic message instead of raw WASM
/// `unreachable` traps the caller can't introspect.
#[wasm_bindgen]
pub fn solve_flop(input: JsValue) -> Result<JsValue, JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| solve_flop_inner(input)));
    match result {
        Ok(r) => r,
        Err(e) => {
            let msg = if let Some(s) = e.downcast_ref::<String>() {
                s.clone()
            } else if let Some(s) = e.downcast_ref::<&'static str>() {
                (*s).to_string()
            } else {
                "unknown panic".to_string()
            };
            Err(JsValue::from_str(&format!("rust panic: {msg}")))
        }
    }
}

fn solve_flop_inner(input: JsValue) -> Result<JsValue, JsValue> {
    let input: SolveInput = serde_wasm_bindgen::from_value(input)
        .map_err(|e| JsValue::from_str(&format!("bad input: {e}")))?;

    // Build card config — board + ranges.
    let board = parse_board(&input.board)
        .map_err(|e| JsValue::from_str(&format!("bad board: {e}")))?;
    let oop_range = postflop_solver::Range::from_sanitized_str(&input.oop_range)
        .map_err(|e| JsValue::from_str(&format!("oop range: {e}")))?;
    let ip_range = postflop_solver::Range::from_sanitized_str(&input.ip_range)
        .map_err(|e| JsValue::from_str(&format!("ip range: {e}")))?;
    let card_config = CardConfig {
        range: [oop_range, ip_range],
        flop: board,
        ..Default::default()
    };

    // Tree config — simplified bet sizing. Matches what the cash
    // batch used so solves stay comparable. Each `?` here surfaces
    // whatever BetSizeOptions parser error to the caller instead of
    // the previous `.unwrap()` which trapped the whole module.
    let flop_bet = || {
        BetSizeOptions::try_from(("33%,75%", "3x"))
            .map_err(|e| JsValue::from_str(&format!("flop bet sizes: {e}")))
    };
    let turn_bet = || {
        BetSizeOptions::try_from(("60%,125%", "3x"))
            .map_err(|e| JsValue::from_str(&format!("turn bet sizes: {e}")))
    };
    let tree_config = TreeConfig {
        initial_state: BoardState::Flop,
        starting_pot: (input.pot * 100.0) as i32, // chips, BB-scaled
        effective_stack: (input.eff_stack * 100.0) as i32,
        rake_rate: 0.0,
        rake_cap: 0.0,
        flop_bet_sizes: [flop_bet()?, flop_bet()?],
        turn_bet_sizes: [turn_bet()?, turn_bet()?],
        river_bet_sizes: [turn_bet()?, turn_bet()?],
        turn_donk_sizes: None,
        river_donk_sizes: None,
        add_allin_threshold: 1.5,
        force_allin_threshold: 0.15,
        merging_threshold: 0.1,
    };

    let action_tree = ActionTree::new(tree_config)
        .map_err(|e| JsValue::from_str(&format!("tree: {e}")))?;
    let mut game = PostFlopGame::with_config(card_config, action_tree)
        .map_err(|e| JsValue::from_str(&format!("game: {e}")))?;
    // `true` = enable compression, which halves the memory footprint
    // at ~5% speed cost. Important on WASM where the linear-memory
    // cap is 4GB but each browser/runtime enforces much tighter
    // limits. Without this, wide ranges + deep trees abort with a
    // memory-grow failure masquerading as `unreachable`.
    game.allocate_memory(true);

    let target = input.accuracy / 100.0;
    let expl = solve(&mut game, input.max_iter, target, false);

    // Extract root strategy.
    game.cache_normalized_weights();
    let actions = root_action_labels(&game);
    let mix = root_mix(&game);

    let out = SolveOutput {
        actions,
        mix,
        exploitability: expl * 100.0,
        iterations: input.max_iter,
    };
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}

fn parse_board(board: &[String; 3]) -> Result<[u8; 3], String> {
    let mut out = [0u8; 3];
    for (i, s) in board.iter().enumerate() {
        out[i] = postflop_solver::card_from_str(s)
            .map_err(|e| format!("card '{s}': {e}"))?;
    }
    Ok(out)
}

/// Readable labels for the root node's action set.
fn root_action_labels(_game: &PostFlopGame) -> Vec<String> {
    // Mapping depends on the concrete action_tree above. Our flop
    // config is: Check + Bet 33% + Bet 75%. Label them accordingly.
    vec![
        "check".to_string(),
        "bet33".to_string(),
        "bet75".to_string(),
    ]
}

/// Flatten the root strategy into { "AsKh" → [0.4, 0.3, 0.3] }.
fn root_mix(game: &PostFlopGame) -> std::collections::HashMap<String, Vec<f32>> {
    let mut out = std::collections::HashMap::new();
    // The root node is OOP's decision. strategy() returns per-action
    // weights flat-packed as [combo0_a0, combo0_a1, ..., combo1_a0, ...].
    // We walk OOP's (sanitised) range in order and slot the weights.
    let strategy = game.strategy();
    let n_actions = game.available_actions().len();
    let range = game.private_cards(0);
    for (i, cards) in range.iter().enumerate() {
        let key = pair_label(cards);
        let freqs: Vec<f32> = (0..n_actions)
            .map(|a| strategy[a * range.len() + i])
            .collect();
        out.insert(key, freqs);
    }
    out
}

fn pair_label(cards: &(u8, u8)) -> String {
    let c0 = card_to_str(cards.0);
    let c1 = card_to_str(cards.1);
    format!("{c0}{c1}")
}

fn card_to_str(c: u8) -> String {
    let rank = c >> 2;
    let suit = c & 3;
    let r = "23456789TJQKA".as_bytes()[rank as usize] as char;
    let s = "cdhs".as_bytes()[suit as usize] as char;
    format!("{r}{s}")
}
