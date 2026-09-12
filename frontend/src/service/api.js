import axios  from 'axios'
const baseURL =import.meta.env.VITE_API_URL||'http://localhost:3000'

const api = axios.create({
    baseURL: baseURL   
})

api.interceptors.request.use((config)=>{
    try {
        const token = localStorage.getItem('token')
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    } catch (error) {
        return Promise.reject(error)
    }
})

api.interceptors.response.use(
    (response)=> response,
    (error) => {

        const rotaLogin = error.config?.url?.includes('/login')
        
        if(error.response&&error.response.status ===401&&!rotaLogin){
        console.warn('Sessão expirarda ou não autorizada. Faça login novamente.')
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.location.href = '/login'            
        }
        return Promise.reject(error)
    }
)

export default api