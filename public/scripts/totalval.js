const totalbtn=document.getElementById('totalbtn')
console.log(totalbtn)
let value
const fetchtotaldata=async()=>{
    const datas=await fetch('cart/item')
    const data=await datas.json()
    if(!data){
        value=0
        totalbtn.textContent=value
        return
    }
    const price=data.orders.map((val)=>{
        return val.quanity * val.price
    })
    const totalprice=price.reduce((pre,cur)=>{
        return pre+cur
    },0)
    value=totalprice
    totalbtn.textContent=value
}
fetchtotaldata()