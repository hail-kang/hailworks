# hailworks
Hailworks official website

## 외주 대금 결제

- 홈의 ‘대금 결제’ 메뉴 → `payment.html` 결제 전용 페이지 → 페이앱 공용 결제 링크 순서로 이동합니다.
- 고객에게 전달할 결제 안내 주소: https://hail-kang.github.io/hailworks/payment.html (배포 후 사용).
- 결제 링크: https://www.payapp.kr/L/z4o6B9
- 고객이 계약상 부가세 포함 최종 청구금액을 직접 입력하고, 결제메모에 프로젝트명과 의뢰인명을 남깁니다.
- 신용카드 결제, 과세, 주소 요청 없음으로 설정했습니다.
- 링크 수정: 페이앱 판매자 관리자 → 결제링크관리 → 결제링크 리스트 → 수정.
- 링크를 교체하면 `payment.html`의 `.payment-link`와 이 문서를 함께 수정합니다.
- 결제 완료 여부와 실제 입금액은 페이앱 관리자에서 계약 내용과 대조합니다. 홈페이지 자체에서 결제 완료를 판정하지 않습니다.
- API 키나 고객별 계약 정보를 정적 사이트에 저장하지 않습니다.

## 로컬 확인

```sh
python3 -m http.server 8080
node --test tests/orbit.test.cjs
```

GitHub Pages 반영에는 배포 브랜치에 변경사항을 커밋·푸시하는 과정이 필요합니다.
