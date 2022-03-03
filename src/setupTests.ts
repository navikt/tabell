import Enzyme, { shallow, render, mount } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { act } from 'react-dom/test-utils'
import 'jest-styled-components'
import crypto from 'crypto'

Enzyme.configure({ adapter: new Adapter() });

(global as any).crypto = crypto;
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length)
  }
});

(global as any).shallow = shallow;
(global as any).render = render;
(global as any).mount = mount;
(global as any).act = act
