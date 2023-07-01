import { toast } from 'react-toastify';

const notifySuccess = (message) => {
    toast.success(message, {
        position: toast.POSITION.TOP_CENTER
    });
}

const notifyError = (message) => {
    toast.error(message, {
        position: toast.POSITION.TOP_CENTER
    });
}

export default {
    notifySuccess,
    notifyError
}
