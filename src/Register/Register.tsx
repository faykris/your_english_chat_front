import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Register.css';

type Inputs = {
  fullname: string
  username: string
  isModerator: boolean
  password: string
  confirmPassword: string
}

const Register: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const { password, confirmPassword, fullname, isModerator, username } = data
      setLoading(true);
      if (password !== confirmPassword) {
        setError('Password and confirm password must be equals');
        setLoading(false);
        return;
      }
      if (password.length < 5) {
        setError('Password too short');
        setLoading(false);
        return;
      }
      const registerResponse = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/auth/register`,
        {
          fullname, username, password, isModerator
        },
        {}
      );
      if (registerResponse.status === 201) {
        onRegister();
      }
    } catch (error: any) {
      console.error('error:', error);
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return <div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type='text' placeholder='Name' {...register("fullname", { required: true })} />
      {errors.fullname ? <span>This field is required</span> : <span>&nbsp;</span>}
      <input type='text' placeholder='Username' {...register("username", { required: true })} />
      {errors.username ? <span>This field is required</span> : <span>&nbsp;</span>}
      <input type='password' placeholder='Password' {...register("password", { required: true })} />
      {errors.password ? <span>This field is required</span> : <span>&nbsp;</span>}
      <input type='password' placeholder='Confirm password' {...register("confirmPassword", { required: true })} />
      {errors.confirmPassword ? <span>This field is required</span> : <span>&nbsp;</span>}
      <div className="moderator">
        <label htmlFor="isModerator">Are you moderator?</label>
        <input type='checkbox' id="isModerator" {...register("isModerator", )} />
      </div>
      <p className="error">{error}</p>
      <div className='login-submit'>
        <p>If you already have an account, login <span onClick={onRegister}>here</span> </p>
        <button className='btn-primary' type="submit" disabled={loading}>
          { loading ? '...' : 'Create' }
        </button>
      </div>
    </form>
  </div>
}

export default Register;