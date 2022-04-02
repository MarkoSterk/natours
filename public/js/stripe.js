/* eslint-disable */
import { showAlert } from './alerts';
import axios from 'axios'
const stripe = Stripe('pk_test_51Kk1Q6Dv16OiKg9PkWhEhwaz848ttP2mddXgGgR1DRzwEN82iiQLeFZ5IIntrDDiCuADnK8DZZa3AyYwFq4gdsDl001dzVTH2e');

export const bookTour = async tourId => {
    try{
        // 1) get the session from the server
        //axios simple GET request
        const session = await axios(`/app/v1/bookings/checkout-session/${tourId}`);

        //console.log(session);

        // 2) Create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch(err){
        showAlert('error', err)
    }
}