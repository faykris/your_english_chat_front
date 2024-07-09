import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Login.css';
import Register from "../Register/Register";

type Inputs = {
  username: string
  password: string
};

const Login: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/auth/login`,
        {
          username: data.username,
          password: data.password
        }
      );
      const accessToken = response.data.accessToken;
      localStorage.setItem('token', accessToken);
      onLogin(accessToken);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  const switchRegister = () => {
    setIsRegister(!isRegister);
  }

  return (
    <div className='Login'>
      <img className='img-bg' alt='img-bg' src="https://img.freepik.com/free-vector/flat-waving-american-flag-background_23-2149396774.jpg" />
      <h1>Your English Class</h1>
      <div className='login-card'>
        <div className='login-title'>
          <h3>
            { isRegister ? 'Register' : 'Login' }
          </h3>
        </div>
        <div className='login-body'>
          {
            !isRegister ?
              <form onSubmit={handleSubmit(onSubmit)}>
                <input type='text' placeholder='Username' {...register("username", { required: true })} />
                {errors.username ? <span>This field is required</span> : <span>&nbsp;</span>}
                <input type='password' placeholder='Password' {...register("password", { required: true })} />
                {errors.password ? <span>This field is required</span> : <span>&nbsp;</span>}
                <div className='login-submit'>
                  <p>Create an account <span onClick={switchRegister}>here</span> </p>
                  <button className='btn-primary' type="submit">Continue</button>
                </div>
              </form> :
              <Register onRegister={switchRegister}></Register>
          }
        </div>
      </div>
      <h3>Access and learn easily!</h3>
      <h5>Created by <a href='https://github.com/faykris'>Cristian Pinzón</a></h5>
    </div>
  );
}

export default Login;