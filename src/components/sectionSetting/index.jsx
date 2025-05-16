'use client'

import Image from 'next/image'
import { useState } from 'react'

//image
import setting from '@/images/setting.svg'

//style
import './sectionSetting.scss'

export default function SectionSetting() {
  const [open, setOpen] = useState(false)
  
  return (
    <div className='sectionSetting'>
      <Image src={setting} alt='setting' onClick={() => { setOpen(!open) }} />
      {open ?
        <div>
          <p>Edit</p>
          <p>Hide</p>
          <p>Delete</p>
        </div>
        : null}
    </div>
  )
}