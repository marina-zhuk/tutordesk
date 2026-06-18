import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from './context/ConfigProvider'
import { useConfig } from './context/useConfig'
import { ToastProvider } from './context/ToastProvider'
import { DataProvider } from './context/DataProvider'
import AppLayout from './layouts/AppLayout'
import Overview from './pages/Overview'
import Students from './pages/Students'
import Lessons from './pages/Lessons'
import Settings from './pages/Settings'

function RoutedApp() {
  // key пересоздаёт DataProvider при смене ниши / сбросе демо.
  const { dataKey } = useConfig()
  return (
    <DataProvider key={dataKey}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="students" element={<Students />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </DataProvider>
  )
}

function App() {
  return (
    <ConfigProvider>
      <ToastProvider>
        <BrowserRouter>
          <RoutedApp />
        </BrowserRouter>
      </ToastProvider>
    </ConfigProvider>
  )
}

export default App
