export function createHooks(callback) {
  const global = {};
  let stateIndex = 0;
  let memoIndex = 0;

  const useState = (initState) => {
    if (!global.states) {
      global.states = [];
    }

    const currentState = global.states[stateIndex] ?? (typeof initState === "function" ? initState() : initState);

    global.states[stateIndex] = currentState;

    const setState = (() => {
      const currentIndex = stateIndex;

      return (value) => {
        if (value === global.states[currentIndex]) return;

        global.states[currentIndex] = value;

        callback();
      };
    })();

    stateIndex += 1;

    return [currentState, setState];
  };

  const useMemo = (fn, refs) => {
    if (!global.memos) {
      global.memos = [];
    }

    if (!global.memos[memoIndex]) {
      const memoizedData = fn();
      global.memos[memoIndex] = { data: memoizedData, refs };
      memoIndex += 1;

      return memoizedData;
    }

    const { data: prevData, refs: prevRefs } = global.memos[memoIndex];

    const isNotChangedRef = refs.every((ref, index) => Object.is(ref, prevRefs[index]));

    if (isNotChangedRef) {
      memoIndex += 1;

      return prevData;
    }

    const newMemoizedData = fn();
    global.memos[memoIndex] = { data: newMemoizedData, refs };
    memoIndex += 1;

    return newMemoizedData;
  };

  const resetContext = () => {
    stateIndex = 0;
    memoIndex = 0;
  };

  return { useState, useMemo, resetContext };
}
