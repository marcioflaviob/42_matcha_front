import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import { Paths } from './Paths'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {Paths.map(item => (
            <Route key={item.path} path={item.path} element={item.component} />
          ))}
        </Route>
      </Routes>
    </>
  )
}

export default App
