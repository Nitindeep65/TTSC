"use client"
import React from 'react'
import { useState } from 'react'

function Navbar() {
    const menuItems=[
    { name:'About' , href:'/'},
    { name:'Testimonials' ,  href:'/'},
    { name:'CTA' , href :'/'},
    { name:'Login/Signup' , href :'/Login'},
    { name:'Dashboard' , href :'/Dashboard'},
    ];
    const[isOpen , setISOPEN]=useState(false)
  return (
    <nav className="bg-white shadow-sm w-full relative z-50 border-b border-gray-100">
    <div className='flex flex-col items-center'>TTSE (TEXT TO SQL ENGINE)</div>
    <button 
    onClick={()=>{setISOPEN(!isOpen)}}
    className='w-10 h-10 flex-col flex items-right justify-items-end gap-1.5 bg-accent focus:outline-none hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200' ></button>
    <div 
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <a 
              key={index} 
              href={item.href} 
              className="group p-4 rounded-xl hover:bg-blue-50/50 transition-colors duration-200 border border-transparent hover:border-blue-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="block text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.name}
              </span>
              <span className="block text-xs text-gray-400 mt-1">
                Go to layout panel
              </span>
            </a>
          ))}
        </div>
    </div>
    </nav>
  )
}

export default Navbar