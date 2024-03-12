# 과제A

## 의도 파악

- 프로토타입의 상속에 대해 이해하고 있는가?
    - 아래 3개의 관계를 알고있는가?
        - 생성자 함수의 prototype 프로퍼티
        - 생성자 함수의 prototype 프로퍼티의 constructor 프로퍼티
        - 생성자 함수로 생성한 인스턴스의 내부슬롯 [[prototype]]
- 자바스크립트의 서브클래스에서 제공하는 super의 동작원리를 아는가?
    - 핵심은 생성자 함수를 수정하지 않고 super를 어떻게 구현하는가?

---

## 1차 구현

- 1차 구현 코드 (https://github.com/choi1five/hanghae/blob/1f7919dfa201ed83d2ccd8f065e3448484b8f27d/packages/chapter1/src/a.js)
     <p align="center">
        <img src="https://github.com/choi1five/hhp-task/assets/99406837/24770af0-2349-4d4d-8946-5e398a678ded" alt="code1" style="width:400px;"/>
     </p
    

### 구현 방법

- 서브 생성자함수(JuniorEngineer)에서 _super 메서드를 Worker의 인스턴스를 싱글턴으로 생성 후 반환하는 방식으로 구현

### 고민 및 접근 방향

- 테스트 코드는 통과되지만 prototype을 통한 상속을 구현했냐에 대한 의문
- 객체지향 프로그래밍의 OCP 관점으로 봤을 때 확장성이 전혀 없고 변경에 열려있다.
    - 상속하려는 슈퍼 클래스가 변경되는 경우 _super 메서드 내부를 수정해야한다.

---

## 2차 구현

- 2차 구현 코드 (https://github.com/choi1five/hanghae/blob/4c2baf7a9540df4d6f9800d07d5321bdb50c7416/packages/chapter1/src/a.js)
     <p align="center">
        <img src="https://github.com/choi1five/hhp-task/assets/99406837/e9b915b6-94f1-44eb-bbba-af6a884b0550" alt="code2" style="width:400px;"/>
     </p>
   

### 구현 방법

- 서브 생성자함수(JuniorEngineer)의 prototype를 Object.create메서드를 통해 슈퍼 생성자함수(Worker)의 prototype을 상속
- constructor 프로퍼티에 생성자 함수를 참조하도록 할당
- *_super메서드에서 this.*_proto__.__proto__.constructor를 통해 슈퍼 생성자함수에 접근하여 인스턴스 생성

### 고민 및 접근 방향

- prototype의 상속 구현을 위해 class를 예제를 그림으로 그려보자

  <p align="center">
      <img src="https://github.com/choi1five/hhp-task/assets/99406837/1462662a-c11b-4658-b77e-dcbcf45cc44b" alt="prototype" style="width:400px;"/>
   </p>
    
- 그림을 그려보니 1차 구현의 코드는 예상한대로 prototype을 통한 상속과는 아무런 관계가 없다.
    - Object.create 및 prototype.constructor를 그림에 맞게 구현
- _super는 상속을 받을 때 사용할건데 1차 구현처럼 부모를 직접적으로 알 필요가 있을까? _super는 그저 슈퍼 생성자함수의 프로퍼티 및 메서드를 상속받게 해주는 책임이다.
그럼 슈퍼 생성자함수에 접근하는 방법을 알아보자
    - “__proto__”을 사용해 내부슬롯 [[prototype]]에 접근했지만 비표준 문법이라 사용하지 않는 것을 권장한다.
        - 가능하면 Object.getPrototypeOf(), Object.setPrototypeOf(), Object.create() 메서드를 사용하는 것이 좋다고 하는데 완전 동일하게 동작되는지는 테스트해봐야할 듯 하다.
     
### 추가 고민

- 슈퍼 생성자함수를 인스턴스화하여 인스턴스 프로퍼티에 할당하는 방법 외에 다른 방법은 없는가?
    - 클래스의 super를 호출 시 인스턴스를 슈퍼 클래스에서 생성하고 반환된 인스턴스를 this에 bind하는 것으로 알고 있는데 이와 같은 로직으로 바꿀 순없을까?

---

## 3차 구현

- 3차 구현 코드 (https://github.com/choi1five/hhp-task/blob/abf8cfd0dc22d12e7059c02945786b32409c51cb/packages/chapter1/src/a.js)

  <p align="center">
        <img src="https://github.com/choi1five/hhp-task/assets/99406837/3c7ea3cc-cc1b-4d48-8342-7cc75a98d86d" alt="code3" style="width:400px;"/>
     </p>
     

### 구현 방법

- _super에서 직접 인스턴스화를 하지않고 생성자 함수를 호출

### 고민 및 접근 방향

- 생성자 함수는 무조건 new로 인스턴스화를 해서 사용하는 것에 익숙해져 생성자 함수를 호출함으로써 인스턴스 프로퍼티를 추가하는 방식은 생각하지 못했다.
([https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/create#object.create를_사용한_고전적인_상속방법](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/create#object.create%EB%A5%BC_%EC%82%AC%EC%9A%A9%ED%95%9C_%EA%B3%A0%EC%A0%84%EC%A0%81%EC%9D%B8_%EC%83%81%EC%86%8D%EB%B0%A9%EB%B2%95)) - 해당 링크에서 힌트를 얻음
- getHealth는 자연스럽게 프로토타입 체인을 따라 사용가능하니 삭제를 하고 문제는 work는 슈퍼 생성자함수의 work를 사용해야하는데 그건 어떻게 할 수 있나?
    - this.__proto__.__proto__.work.call(this)로 접근했으나 기존의 super로 통일되던 것과 달리 너무 사용성이 좋지않아 보인다.

### 추가고민

- 기존 class는 super 키워드로 인스턴스 초기화 및 프로토타입 메서드의 상속까지 다 가능한데 그런 측면에서는 2번의 구현 코드가 더 나은 것이 아닌가?
- __proto__.__proto__을 개선 할 수는 없을까?

---

## 최종 구현

- 최종 구현 코드(https://github.com/choi1five/hhp-task/blob/43526127f8f5c12dabf668833ac4acc32b10aa95/packages/chapter1/src/a.js)
      <p align="center">
        <img src="https://github.com/choi1five/hhp-task/assets/99406837/cd8044a5-b09f-40eb-8d6f-6d9cd3be447e" alt="code3" style="width:400px;"/>
     </p>


### 구현 방법

- super로 method 호출 로직 개선

### 고민 및 접근 방향

- 기존의 this.__proto__.__proto__로 접근하는 방식이 일단 코드가 안예쁘고 하나의 책임을 가지고 있다고 생각된다.
- 그래서 또 다른 함수로 분리하는 것이 코드 퀄리티가 더 좋다고 판단하여 _superMethod라는 메서드를 추가했다.
