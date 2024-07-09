import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Register.css';

type Inputs = {
  fullName: string
  username: string
  isModerator: boolean
  password: string
}

const Register: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const registerResponse = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/auth/register`,
        data,
        {}
      );
      if (registerResponse.status === 201) {
        onRegister();
      }
    } catch (error) {
      console.error('error:', error);
    }
  }

  return <div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type='text' placeholder='Name' {...register("fullName", { required: true })} />
      {errors.fullName ? <span>This field is required</span> : <span>&nbsp;</span>}
      <input type='text' placeholder='Username' {...register("username", { required: true })} />
      {errors.username ? <span>This field is required</span> : <span>&nbsp;</span>}
      <input type='password' placeholder='Password' {...register("password", { required: true })} />
      {errors.password ? <span>This field is required</span> : <span>&nbsp;</span>}
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