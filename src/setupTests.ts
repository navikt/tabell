import { act } from 'react-dom/test-utils'
import 'jest-styled-components'
import {render, fireEvent, screen, getNodeText} from '@testing-library/react'
import crypto from 'crypto'

(global as any).screen = screen;
(global as any).render = render;
(global as any).getNodeText = getNodeText;
(global as any).fireEvent = fireEvent;
(global as any).act = act;

(global as any).crypto = crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length)
  }
});
