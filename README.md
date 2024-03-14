# 과제 B 구현 코드 및 고민 정리

## 의도 파악

- 순서가 보장되는 비동기 로직을 작성하라
    - Promise.all 등의 일괄 처리 x?
- 추가적인 메서드를 정의하는 것이 가능하다.
    - 아마도 고비용 연산을 청크하는 로직?
    - 또는 프로미스로 지연을 만드는 delay 로직?

---

## 1차 구현 -실패

### 고민 및 접근 방향

- 의도와는 별개로 고비용의 작업이라면 **웹 워커**를 사용해 백그라운드에서 처리를 해보는 것도 가능하지 않을까 생각함
- 웹 워커의 경우 별개의 worker파일에 수행할 함수를 작성하는데 **this.**_tasks를 넘겨줄 방법이 있을까?
    - this._tasks는 함수를 담은 배열인데 함수를 넘길 수 있나?

---

## 2차 구현

### 구현 코드

```jsx
  do() {
    let processedCount = 0;
    const chunkSize = 100;

    const processChunk = () => {
      for (let i = 0; i < Math.min(chunkSize, this._tasks.length - processedCount); i++) {
        this._tasks[processedCount + i]();
      }
      processedCount += chunkSize;

      if (processedCount < this._tasks.length) {
        requestAnimationFrame(processChunk);
      }
    };

    processChunk();
  }
```

### 고민 및 접근 방향

- requestAnimationFrame을 사용하자
    - requestAnimationFrame의 콜백은 보통 1초에 60회지만, 일반적으로 대부분의 웹 브라우저에서는 W3C 권장사항에 따라 디스플레이 주사율과 일치
    (https://developer.mozilla.org/ko/docs/Web/API/window/requestAnimationFrame)
    - 60FPS이라면 콜백함수의 실행 시간이 **16.67ms (1/60초)** 이내에 완료되어야한다.
       <p align="center">
    <img width="666" alt="perfomance" src="https://github.com/choi1five/hhp-task/assets/99406837/e91879cf-44d7-421d-b50a-dfb30bd2d824">
     </p>

    
    - 개발자 도구 퍼포먼스 탭에서 시간을 측정해 60FPS에 가깝게 chunkSize를 수정했다
        - 청크 사이즈를 수정하며 퍼포먼스 탭에서 콜백 소요 시간 확인
        - 요즘 많은 모니터인 144Hz라면 1000ms / 144 = **6.94ms다.** 
        해당 시간과 비슷하게 맞춰 청크사이즈를 설정하면 부드러움의 눈으로 봤을 때의 차이점은 덜하지만 확실히 전체 테스크 처리 시간이 오래걸린다.
- ChunkSize100 영상 (60FPS)
    

https://github.com/choi1five/hhp-task/assets/99406837/305fd388-7289-412c-8a61-3909144204bc


  
    
- ChunkSize40 영상 (144FPS)
    
   

https://github.com/choi1five/hhp-task/assets/99406837/8c975634-02e9-415c-a478-2e85e26b340c



### 추가 고민

- 그래도 버벅거림이 있고 처리 시간이 늦어지는 단점을 개선할 필요가 있어보인다.
- 청크 사이즈를 수정하며 노가다하는 무식한 방법대신 현명하게 코드를 구현할 수는 없을까?
- async await을 금지한 것을 보면 Promise를 쓰는 방법이 정답에 가까울 것 같다?

---

## 3차 구현

### 구현코드

```jsx

  do() {
    let processedCount = 0;
    const chunkSize = 100;

    const processChunk = () => {
      for (let i = 0; i < Math.min(chunkSize, this._tasks.length - processedCount); i++) {
        console.log(processedCount + i);
        this._tasks[processedCount + i]();
      }
      
      processedCount += chunkSize;

      if (processedCount < this._tasks.length) {
        requestIdleCallback(processChunk);
      }
    };

    requestIdleCallback(processChunk);
  }
```

### 고민 및 접근 방향

- 렌더링의 중요성을 봤을 때 프로그래그바가 업무량이 변하는 렌더링보다 중요하다고 생각했다.
- 그럼 2차구현 코드에서 do메서드에서 requestAnimationFrame을 사용했었는데 _render에서도 requestAnimationFrame을 쓰니까 둘의 순서가 어떻게 될까를 알아보고 싶었다.
- 테스트 결과 requestAnimationFrame은 언제나 순서가 일정하다.
그럼 가끔 버벅거리던 현상이 _render가 processChunk를 기다리며 버벅된 것이 아닐까하는 생각이 들었다.
- 그러던 중 requestIdleCallback 메서드를 찾았다.  _render가 두 번 실행될 동안 processChunk는 한번 실행된 것을 볼 수 있다. 확실히 chunk 수를 올렸을 때 이전보단 덜 버벅이는 것처럼 보인다.
- requestIdleCallback 애니메이션 외에 백그라운드 작업이나 렌더링에 영향을 미치지 않는 작업에 적합하다는데 실제 화면을 렌더링하는 담당은 _render메서드니 나쁘지 않은 방법일지도…
브라우저 호환성이 좋지 않아 실무적으로는 쓸 일이 있을까 싶다.

![스크린샷 2024-03-15 오전 12 26 34](https://github.com/choi1five/hhp-task/assets/99406837/52b2437e-5218-410d-b36e-8091f8635a81)


- **`requestAnimationFrame` vs `requestIdleCallback`: 동작 방식 비교(GPT 답변)**
    
    **`requestAnimationFrame`**과 `requestIdleCallback`는 모두 브라우저에서 애니메이션을 구현하는 데 사용되는 함수이지만, 작동 방식과 활용 범위에 있어 다음과 같은 차이점이 있습니다.
    
    **1. 작동 방식**
    
    - **`requestAnimationFrame`:**
        - 다음 브라우저 페인팅 전에 함수를 실행하도록 요청합니다.
        - 일반적으로 16ms (60FPS) 간격으로 실행됩니다.
        - 브라우저 렌더링과 밀접하게 연관되어 애니메이션을 부드럽게 표현하는 데 유용합니다.
        - 하지만, 작업량이 많으면 프레임 드랍 현상이 발생할 수 있습니다.
    - **`requestIdleCallback`:**
        - 브라우저 스케줄링 허용 시점에 함수를 실행하도록 요청합니다.
        - 브라우저 렌더링 및 사용자 상호작용에 영향을 최소화하도록 설계되었습니다.
        - 애니메이션 외에 백그라운드 작업이나 렌더링에 영향을 미치지 않는 작업에 적합합니다.
        - `requestAnimationFrame` 와 달리 정확한 실행 간격을 보장하지 않습니다.
    
    **2. 활용 범위**
    
    - **`requestAnimationFrame`:**
        - 애니메이션 구현 (예: 스크롤 애니메이션, 게임 루프)
        - 렌더링 작업 (예: 캔버스 드로잉)
        - 사용자 인터페이스 업데이트 (예: 스크롤바 위치 업데이트)
    - **`requestIdleCallback`:**
        - 백그라운드 작업 (예: 데이터 처리, 네트워크 요청)
        - 사용자 상호작용에 영향을 미치지 않는 작업 (예: CPU 집중적인 계산)
        - 배터리 소모를 줄이는 작업
    
    **3. 선택 가이드**
    
    - **애니메이션이나 렌더링 작업:** `requestAnimationFrame` 사용
    - **백그라운드 작업이나 사용자 상호작용에 영향을 미치지 않는 작업:** `requestIdleCallback` 사용
    - **프레임 드랍 방지가 중요한 경우:** `requestIdleCallback` 사용과 함께 `setTimeout` 함수를 사용하여 작업 시간 제한 설정
    
    **참고:**
    
    - `requestIdleCallback` 함수는 모든 브라우저에서 지원되는 것은 아니므로 호환성을 고려해야 합니다.
    - 상황에 따라 적절한 함수를 선택해야 합니다.
    - 코드 예시는 예시이며, 실제 상황에 맞게 수정해야 합니다.
    
    **다음은 `requestAnimationFrame`과 `requestIdleCallback` 사용 시 고려해야 할 사항입니다.**
    
    - **`requestAnimationFrame`:**
        - 작업량이 많으면 프레임 드랍 현상이 발생할 수 있으므로 작업을 적절하게 분할해야 합니다.
        - 렌더링 작업 과도하게 사용하면 성능 저하를 야기할 수 있으므로 주의해야 합니다.
    - **`requestIdleCallback`:**
        - 정확한 실행 간격을 보장하지 않으므로 작업 진행 상황을 별도로 관리해야 할 수 있습니다.
        - 백그라운드 작업이 지나치게 CPU를 사용하면 사용자 인터페이스 반응 속도가 느려질 수 있으므로 주의해야 합니다.


---

## 번외 구현

```jsx
 //setTimeout
  do() {
    let processedCount = 0;
    const chunkSize = 100;

    const processChunk = () => {
      for (let i = 0; i < Math.min(chunkSize, this._tasks.length - processedCount); i++) {
        this._tasks[processedCount + i]();
      }
      processedCount += chunkSize;

      if (processedCount < this._tasks.length) {
        setTimeout(() => {
          processChunk();
        }, 0);
      }
    };

    return processChunk();
  }
  
  //Promise + setTimeout
   do() {
    let processedCount = 0;
    const chunkSize = 100;

    const processChunk = () => {
      for (let i = 0; i < Math.min(chunkSize, this._tasks.length - processedCount); i++) {
        this._tasks[processedCount + i]();
      }
      processedCount += chunkSize;

      if (processedCount < this._tasks.length) {
        new Promise((resolve) =>
          setTimeout(() => {
            resolve(processChunk());
          }, 0)
        );
      }
    };

    return processChunk();
  }
```

### 고민

- 청크를 하게되면 과제 코드한정으로 동작의 큰차이는 없다.
- 어떤 방식을 사용하는 것이 베스트인지 잘 모르겠다.
    - 어떻게 테스트를 해보고 어떻게 디버깅을 해야 적합한 비동기처리인지 몸소 체험할 수 있을까??
- micro task, animation frame, macro task 순으로 비동기 우선순위를 가지는 것은 알고 있지만 그 이상의 적절한 활용은 아직 갈 길이 멀어보인다.
