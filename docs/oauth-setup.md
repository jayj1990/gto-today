# 네이버 · 카카오 로그인 설정 가이드

gto.today 는 Auth.js v5 를 쓰며, Google OAuth 는 이미 붙어 있습니다. 이 문서는 **네이버** 와 **카카오** 를 추가로 붙일 때 Jay 가 개발자 콘솔에서 해야 할 작업입니다. 코드 쪽은 별도 PR 로 제가 붙여둘게요.

---

## 필요한 환경변수 (최종)

```env
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
```

로컬은 `apps/web/.env.local`, 프로덕션은 Vercel 프로젝트 설정 → Environment Variables 에 넣습니다.

---

## 네이버 로그인 등록 (약 5~7분)

1. https://developers.naver.com/apps/ 접속 → NAVER 계정 로그인
2. **"Application 등록"** 클릭
3. 입력:
   - **애플리케이션 이름**: `gto.today`
   - **사용 API**: `네이버 로그인` 체크
   - **제공 정보 선택**: `이메일 주소`, `이름` 필수 (닉네임·프로필 사진 선택)
   - **환경 추가**: `PC 웹`
   - **서비스 URL**:
     - 프로덕션: `https://gto.today`
     - 로컬 개발: `http://localhost:3010` (포트 다르면 수정)
   - **Callback URL**:
     - `https://gto.today/api/auth/callback/naver`
     - `http://localhost:3010/api/auth/callback/naver`
4. 등록 완료 → **Client ID** / **Client Secret** 복사
5. Vercel 환경변수에 입력:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`

### 네이버 콜백 주의사항

- Callback URL 은 **정확히 일치**해야 함 (trailing slash 주의)
- 서비스 URL 과 Callback URL 의 도메인이 일치해야 함
- localhost 는 포트 번호까지 정확히

---

## 카카오 로그인 등록 (약 5~7분)

1. https://developers.kakao.com/console/app 접속 → 카카오 계정 로그인
2. **"애플리케이션 추가하기"** 클릭
3. 입력:
   - **앱 이름**: `gto.today`
   - **사업자명**: 개인이면 본명, 법인이면 법인명
4. 생성된 앱 클릭 → 왼쪽 메뉴에서:

### 4-1. **앱 키** 확인

- **REST API 키** 를 복사 → 이게 `KAKAO_CLIENT_ID`

### 4-2. **플랫폼** → Web 플랫폼 등록

- **사이트 도메인**:
  - `https://gto.today`
  - `http://localhost:3010`

### 4-3. **카카오 로그인** 활성화

- 좌측 메뉴 → `제품 설정` → `카카오 로그인`
- **활성화 설정** ON
- **Redirect URI** 추가:
  - `https://gto.today/api/auth/callback/kakao`
  - `http://localhost:3010/api/auth/callback/kakao`

### 4-4. **동의 항목** 설정

- 좌측 메뉴 → `카카오 로그인` → `동의항목`
- 다음 3개를 **필수 동의** 로 설정:
  - 닉네임 (`profile_nickname`)
  - 프로필 사진 (`profile_image`) — 선택 동의여도 됨
  - 카카오계정(이메일) (`account_email`)

### 4-5. **Client Secret** 생성

- 좌측 메뉴 → `카카오 로그인` → `보안`
- **"코드 생성"** 클릭
- **활성화** ON
- 생성된 코드 복사 → 이게 `KAKAO_CLIENT_SECRET`

### 4-6. Vercel 환경변수 입력

- `KAKAO_CLIENT_ID` = REST API 키 (4-1)
- `KAKAO_CLIENT_SECRET` = 보안에서 생성한 코드 (4-5)

### 카카오 콜백 주의사항

- 카카오는 **Client Secret 을 따로 켜지 않으면 동작 안 함** — 4-5 단계 빼먹지 말 것
- 이메일 동의는 **필수 동의** 로 해야 Auth.js 에서 유저 식별 가능

---

## 등록 후 배포 순서

1. Vercel 환경변수 4개 입력 (네이버 2 + 카카오 2)
2. 저한테 **"키 입력 완료"** 알려주세요
3. 제가 code PR 머지 → Vercel 자동 재배포
4. `/signin` 페이지에 3개 버튼 (Google/Naver/Kakao) 노출

---

## 트러블슈팅

| 증상                                  | 원인                | 해결                                                            |
| ------------------------------------- | ------------------- | --------------------------------------------------------------- |
| `OAuthCallback` 500                   | Callback URL 불일치 | 콘솔에서 정확한 URL 재확인 (trailing slash)                     |
| 카카오 로그인 후 `Configuration` 에러 | Client Secret 누락  | 4-5 단계 확인, Vercel 에 `KAKAO_CLIENT_SECRET` 값 정확한지 확인 |
| 네이버 로그인 후 이메일이 null        | 이메일 동의 안 받음 | 4-4 에서 이메일을 **필수 동의** 로 변경                         |
| 유저 이름이 undefined                 | 닉네임 동의 안 받음 | 동의항목 재설정                                                 |

---

## 참고 링크

- Auth.js Naver provider: https://authjs.dev/getting-started/providers/naver
- Auth.js Kakao provider: https://authjs.dev/getting-started/providers/kakao
- 네이버 로그인 API 문서: https://developers.naver.com/docs/login/api/
- 카카오 로그인 레퍼런스: https://developers.kakao.com/docs/latest/ko/kakaologin/common
