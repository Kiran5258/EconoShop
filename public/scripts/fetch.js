const fetchbtn=document.getElementById('fetchbtn')
const cartval=document.getElementById('cartval')
const error=document.getElementById('error')
let data
let quanity
const itemdata=async()=>{
    const res=await fetch('/data')
    data=await res.json()
}
itemdata()
const fetchdata=async()=>{
    const res=await fetch('/cart/item')
    const val=await res.json()
    return val
}
const quantityFetcher = async ()=> {
    const res1 =await fetch('/cart/quanity')
    const  res = await res1.json()
    if(res === null) {
        quanity = 0
        return
    }
    for(const order of res.orders) {
        if(order.title == data.title) {
            quanity = order.quanity || 0
        }
    }
}
const totals=async()=>{
    const datas=await fetch('/cart/item')
    const data=await datas.json()
    if(data===null){
        return 0
    } 
    const Totalquantity = data.orders.map((val,index)=> {
        return val.quanity
    })
    const total = Totalquantity.reduce((pre,cur)=> {
        return pre+cur
    },0)
    return total || 0

}
const val = async()=> {
    cartval.textContent = await totals()
}
val()
const fetcher = async () => {
    await quantityFetcher()
    const res = await fetch(`/cart/item`,{
       method:'POST',
       body:JSON.stringify({title:data.title,price:data.price,quanity:quanity+=1}),
       headers : {
           'Content-Type':'application/json'
       }
    })
    cartval.textContent = await totals()
    if(!res.ok) {
        error.style.display = 'block'
        error.textContent = "Please Do Login To Continue"
    }
}



fetchbtn.addEventListener('click',fetcher)