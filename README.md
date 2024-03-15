# 심화 과제 구현 코드 및 고민 정리 - 실패
## 최적화는 실패했지만 접근 방향을 공유하고자 업로드

## 구현 코드 - 실패

```jsx
export function JuniorEngineer(health, intelligence) {
  this._super(health);
  this._intelligence = intelligence ?? 1;
  this._isBornGenius = this._intelligence > 10;
}
```

## 고민 및 접근 방향

- 히든 클래스와 인라인 캐싱을 사용하려면 객체 내 모두 같은 필드 구조를 가져야한다. (https://meetup.nhncloud.com/posts/78)
- 그럼 조건에 따라 있을 수도 있고 없을 수도 있는 _isBornGenius 필드를 10000000의 루프에서 모두 가지는게 인라인 캐싱이 되어 최적화가 될 것으로 판단했다.
- 하지만 오히려 시간이 늘어났다?

- commonJs vs esModule
    - 30ms 정도 es모듈이 더 느리다. 왜?
