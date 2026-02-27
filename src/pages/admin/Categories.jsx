import React, {useState} from 'react'

export default function Categories() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  function onFile(e) {
    const f = e.target.files[0]
    setImage(f)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else setPreview(null)
  }

  function submit(e) {
    e.preventDefault()
    console.log('create category', { name, description, image })
    alert('تم إنشاء القسم (تجريبي)')
    setName('')
    setDescription('')
    setImage(null)
    setPreview(null)
  }

  return (
    <div>
      <div className="card admin-card">
        <div className="header">
          <div className="h-title">إنشاء قسم جديد</div>
          <div className="h-sub">أدخل اسم القسم ووصفه وأضف صورة مناسبة</div>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="input">
            <label>اسم القسم</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: إلكترونيات" />
          </div>

          <div className="input">
            <label>الوصف</label>
            <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف قصير للقسم" />
          </div>

          <div className="input">
            <label>صورة القسم</label>
            <div className="file-input-wrapper">
              <input id="category-image" type="file" accept="image/*" onChange={onFile} />
              <label htmlFor="category-image" className="file-btn">اختر صورة</label>
              <button type="button" className="file-ghost" onClick={()=>document.getElementById('category-image').click()}>استعراض</button>
              <div className="file-name">{image? image.name : 'لم يتم اختيار ملف'}</div>
            </div>
            {preview && <img src={preview} alt="preview" style={{width:120,marginTop:10,borderRadius:8}} />}
          </div>

          <div className="row">
            <button className="btn btn-primary" type="submit">حفظ القسم</button>
            <button type="reset" className="btn btn-ghost" onClick={()=>{setName('');setDescription('');setImage(null);setPreview(null)}}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}
