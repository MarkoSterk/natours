/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/app/v1/users/updateMyPassword'
        : '/app/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} was updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
