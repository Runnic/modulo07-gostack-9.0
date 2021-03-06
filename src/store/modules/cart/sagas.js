import { call, select, put, all, takeLatest } from 'redux-saga/effects'

import api from '../../../services/api'
import history from './services/history'
import { addToCartSucess, updateAmountSuccess } from './actions'
import { formatarPreco } from '../../../utils/format'
import { toast } from 'react-toastify'

function* addToCart({ id }) {
    const productExits = yield select(
        state => state.cart.find(product => product.id === id) 
    )

    const stock = yield call(api.get, `/stock/${id}`)

    const stockAmount = stock.data.amount
    const currentAmount = productExits ? productExits.amount : 0
    const amount = currentAmount + 1
    
    if(amount > stockAmount) {
        toast.error('Quantidade solicitada indísponivel no estoque.')
        return
    }

    if(productExits) {
        yield put(updateAmountSuccess(id, amount))
    }else{
        const response = yield call(api.get, `/products/${id}`)

        const data = {
            ...response.data,
            amount: 1,
            priceFormatted: formatarPreco(response.data.price)
        }

        yield put(addToCartSucess(data))
        history.push('/cart')
    }
}

function* updateAmount({ id, amount }) {
    
    if(amount <= 0) return
    
    const stock = yield call(api.get, ` /stock/${id}`)
    const stockAmount = stock.data.amount

    if(amount > stockAmount){
        toast.error('Quantidade solicitada indísponivel no estoque.')
        return
    }

    yield put(updateAmountSuccess(id, amount))
}

export default all([
    takeLatest('@cart/ADD_REQUEST', addToCart),
    takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount)
])