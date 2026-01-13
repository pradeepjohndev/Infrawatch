import React, { useState } from 'react'
import logo from '../assets/react.svg';
import { HousePlug, Menu, AlignHorizontalDistributeCenter, NotepadText, MessageSquareWarning, Settings, CircleUser, LogOut } from 'lucide-react';

const menuItems = [
    {
        icons: <HousePlug size={20} />,
        label: 'Home'
    },
    {
        icons: <AlignHorizontalDistributeCenter size={20} />,
        label: 'Dashboard'
    },
    {
        icons: <NotepadText size={20} />,
        label: 'Report'
    },
    {
        icons: <MessageSquareWarning size={20} />,
        label: 'Alerts'
    },
    {
        icons: <Settings size={20} />,
        label: 'Setting'
    }
]

export default function Sidebar() {

    const [open, setOpen] = useState(true)

    return (
        <aside className="h-screen shrink-0">
            <nav className={`shadow-md h-screen p-2 flex flex-col duration-500 bg-blue-900 text-white ${open ? 'w-60' : 'w-16'}`}>

                <div className=' px-3 py-2 h-20 flex justify-between items-center'>
                    <img src={logo} alt="Logo" className={`${open ? 'w-10' : 'w-0'} rounded-md`} />
                    <div><Menu size={34} className={` duration-500 cursor-pointer ${!open && ' rotate-180'}`} onClick={() => setOpen(!open)} /></div>
                </div>

                <ul className='flex-1'>
                    {
                        menuItems.map((item, index) => {
                            return (
                                <li key={index} className='px-3 py-2 my-2 hover:bg-blue-800 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group'>
                                    <div>{item.icons}</div>
                                    <p className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>{item.label}</p>
                                    <p className={`${open && 'hidden'} absolute left-32 shadow-md rounded-md
                 w-0 p-0 text-black bg-white duration-100 overflow-hidden group-hover:w-fit group-hover:p-2 group-hover:left-16
                `}>{item.label}</p>
                                </li>
                            )
                        })
                    }
                </ul>
                {/* footer */}
                <div className='flex items-center gap-2 px-3 py-2 hover:bg-blue-600 rounded-4xl'>
                    <div><CircleUser size={30} /></div>
                    <div className={`leading-5 ${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden flex items-center gap-20`}>
                        <p>user1</p>
                        <span className='text-sm text-gray-300 rounded-4xl hover:bg-blue-800 p-2'><LogOut onClick={() => alert('User profile clicked')} className='hover:text-red-500'/></span>
                    </div>
                </div>
            </nav>
        </aside>
    )
}
