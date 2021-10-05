import React from 'react';
import {
  RecoilRoot
} from 'recoil';
import MainContent from './container/index';

function App() {
  return (
    <RecoilRoot>
      <MainContent />
    </RecoilRoot>
  );
}

export default App;
