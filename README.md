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

---

## 해결하지 못한 고민

- 슈퍼 생성자함수를 인스턴스화하여 인스턴스 프로퍼티에 할당하는 방법 외에 다른 방법은 없는가?
    - 클래스의 super를 호출 시 인스턴스를 슈퍼 클래스에서 생성하고 반환된 인스턴스를 this에 bind하는 것으로 알고 있는데 이와 같은 로직으로 바꿀 순없을까?
