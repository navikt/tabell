import { createRoot } from 'react-dom/client'
import React from 'react'
import Page from 'page/page'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<Page />)
