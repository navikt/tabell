import React from 'react'

export default (props: any) => (
  <svg
    contentScriptType='text/ecmascript'
    zoomAndPan='magnify'
    id='Layer_1' version='1.1'
    preserveAspectRatio='xMidYMid meet'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    width={24} height={24}
    x='0px' y='0px' {...props}
  >
    <path fill={props.color || 'green'} xmlns='http://www.w3.org/2000/svg' d='M12,0C5.383,0,0,5.384,0,12s5.383,12,12,12c6.616,0,12-5.384,12-12S18.616,0,12,0z M17.341,8.866l-7.5,7  C9.745,15.955,9.622,16,9.5,16c-0.129,0-0.256-0.049-0.354-0.146l-2.5-2.5c-0.195-0.195-0.195-0.512,0-0.707s0.512-0.195,0.707,0  l2.158,2.158l7.147-6.67c0.201-0.188,0.518-0.179,0.707,0.023S17.543,8.677,17.341,8.866z' />
  </svg>
)
