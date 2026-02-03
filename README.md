# 🏦 Crypto ETF 옵션 트래커

비트코인, 이더리움 ETF의 옵션 거래를 추적하고 이상 거래를 감지하는 대시보드입니다.

## 지원 ETF

- **IBIT** - BlackRock Bitcoin ETF
- **ETHA** - BlackRock Ethereum ETF  
- **FBTC** - Fidelity Bitcoin ETF
- **ARKB** - ARK 21Shares Bitcoin ETF
- **BITB** - Bitwise Bitcoin ETF
- **GBTC** - Grayscale Bitcoin Trust

## 기능

- 📊 행사가별 거래량 차트
- 📈 행사가별 미결제약정 차트
- 🎯 Put/Call 비율 분석
- 🔥 이상 거래 감지 (Vol/OI > 0.5)
- 만기일별 데이터 조회

## 데이터 출처

Yahoo Finance (무료, 15분 지연)

## 개발

```bash
npm install
npm run dev
```

## 배포

GitHub Pages로 자동 배포됩니다.

```bash
git add .
git commit -m "Update"
git push
```
