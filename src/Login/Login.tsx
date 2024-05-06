import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Login.css';
import Register from "../Register/Register";

type Inputs = {
  email: string
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
          email: data.email,
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
      <h1>Currency Chatbot</h1>
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
                <input type='text' placeholder='Email' {...register("email", { required: true })} />
                {errors.email ? <span>This field is required</span> : <span>&nbsp;</span>}
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
      <h3>Make your conversions easily!</h3>
      <h5>Created by <a href='https://github.com/faykris'>Cristian Pinzón</a></h5>
    </div>
  );
}

export default Login;