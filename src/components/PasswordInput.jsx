import React, {useState} from 'react'

export default function PasswordInput({value,onChange,placeholder}){
  const [reveal,setReveal] = useState(false)
  return (
    <div className="password-wrap">
      <input
        type={reveal? 'text':'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={reveal? 'إخفاء كلمة المرور':'إظهار كلمة المرور'}
        onClick={()=>setReveal(r=>!r)}
      >
        {reveal ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
