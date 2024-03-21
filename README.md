## 코드 링크 ( https://github.com/choi1five/hhp-task/blob/week02/taskA/packages/chapter2/src/render.js )

## 고민 및 접근 방향

- jsx는 어떤 역할을 해야하나?
  - jsx처럼 보이게 만들어줘야하나?
  - jsx처럼 보이는 역할을 자료구조로 가공해야 하나?
    ⇒ **JSX 처럼 보이게 문자열로 변환 시 innerHtml을 사용하거나 다시 createElement을 통해 DOM으로 만들기 번거로움이 있을 것으로 예상되어 { type, props, children} 객체 형태로 반환**
  - children의 경우 children의 길이가 1이고 string 타입이면 배열을 사용할 필요가 있을까 생각했지만 `**<p><span>스팬 태그</span>스트링</p>**` 같은 케이스도 있기에 배열의 형태로 반환함

---

- createElement는 언제 사용하는 것이 적절한가?
  - jsx에서 반환한 객체로 render 내부 조건문에서 비교 후 변환
  - render 시 초기에 변환
    **⇒ 조건문 내부에서 반환 시 매번 새로운 메모리에 할당되기 때문에 테스트 코드에 있는 기존 노드와 비교하는 테스트를 성공할 수 없다고 판단하여 render 초기에 createElement로 변환 후 재귀 render시 다시 createElement를 하지 않도록 `instanceof Element` 로 판별하여 처리함**

---

- render의 index는 어떻게 사용하는 것이 좋을까?
  - 단순히 생각했을 때 DOM 트리의 depth를 나타내거나 sibling 노드를 체크하는 용도로 쓰일 것으로 판단했다.
    **⇒ 구현 코드에서는 depth의 용도로 사용했고 index === 0 인 경우 oldNode를 parent에 연결하는 용도로 사용했다.**
  - oldNode 자체가 하나의 노드가 아닐 가능성은 없는가?
    - fragment 개념을 사용해야하나?

---

- updateAttributes에 props를 어떻게 넘겨주는 것이 좋은가?
  ⇒ **attributes를 넘기고 name과 value 값을 사용하여 처리**
  - 이벤트 핸들러는 어떻게 처리할 수 있을까?
  - 리액트에서도 root에 event를 추가하고 이벤트 전파를 통해 처리하니 괜찮나?

---

- updateAttributs에 **`element.attributes`** 를 사용해 for of 문으로 순회 시 예상대로 동작되지 않는 이슈가 있다.
  - id만 삭제하고 class는 순회하지 않음
    - NamedNodeMap도 이터러블 객체기 때문에 순회는 됐지만 유사배열 객체여서 그런가? 예상대로 동작하지 않음
    - 스프레드 문법을 통해 배열로 변환 후 순회하여 해당 이슈 해결
