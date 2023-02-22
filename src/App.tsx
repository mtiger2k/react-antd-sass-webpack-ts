import React, { Suspense, lazy } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import './index.scss'

const Computer = lazy(() => import(/* webpackChunkName:"Computer", webpackPrefetch: true*/ './components/Computer'))
const Phone = lazy(() => import(/* webpackChunkName:"Phone", webpackPrefetch: true */ './components/Phone'))

const App: React.FC = () => {
  return (
    <div className='App'>
      <h2>hello react</h2>
      <div className='App-img'></div>
      <div className='App-content'>
        <ul>
          <li>
            <Link to="/Computer">Computer</Link>
          </li>
          <li>
            <Link to="/Phone">Phone</Link>
          </li>
        </ul>
      </div>

      <hr/>

      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/Computer" element={<Computer />}></Route>
          <Route path="/Phone" element={<Phone />}></Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App