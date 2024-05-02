import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Home.css';
import botMessages from '../botMessages.json'

type userObject = {
  _id: string,
  fullName: string,
  email: string,
  password: string,
  conversation: any[],
  createdAt: Date,
  updatedAt: Date,
  __v: number
}

type Inputs = {
  message: string
}

const currencies = ['USD', 'GBP', 'EUR', 'AUD', 'COP'];

const Home: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<userObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [botId, setBotId] = useState(0);
  const [errorBotId, setErrorBotId] = useState(0);
  const [firstValue, setFirstValue] = useState<string | null>(null);
  const [secondValue, setSecondValue] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<Inputs>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUser()
      .then((res) => {
        setUser(res);
        scrollToBottom();
      })
      .catch(async (err) => {

        onLogout();
      });
  }, [token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const getUser = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACK_URL}/user`,
      {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
      }
    );
    return response?.data;
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const userResponse = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/user/addMessage`,
        {
          userId: user?._id,
          message: data.message.trim(),
          role: 2
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      );
      setUser(userResponse?.data);

      if ((botId === 1 || botId === 2) && !currencies.includes(data.message.trim())) {
        setErrorBotId(botId);
        setBotId(4);
      } else if (!firstValue && currencies.includes(data.message.trim()) ) {
        setFirstValue(data.message.trim());
      } else if (firstValue && !secondValue && currencies.includes(data.message.trim())) {
        setSecondValue(data.message.trim());
      } else if (firstValue && secondValue && !amount && currencies.includes(data.message.trim())) {
        setAmount(data.message.trim())
      }

      let botMessage = '';
      switch (botId) {
        case 0: // Welcome message and insert first value
          botMessage = botMessages.filter(b => b.id === 1)[0].message;
          setBotId(1);
          break;
        case 1: // Second value inserted
          botMessage = botMessages.filter(b => b.id === 2)[0].message;
          setBotId(2);
          break;
        case 2: // Amount value inserted
          botMessage = botMessages.filter(b => b.id === 3)[0].message;
          setBotId(3);
          break;
        case 3: // Response with conversion and return to welcome
          botMessage = botMessages.filter(b => b.id === 4)[0].message;
          const response = await getCurrencyConversion(firstValue, secondValue, data.message.trim());
          if (response.data.success) {
            botMessage += `\n - ${firstValue} to ${secondValue} = ${response.data.result}`
          } else {
            botMessage = `An error occurred: ${response.data.error.info}`
          }
          setFirstValue(null);
          setSecondValue(null)
          setBotId(0);
          break;
        case 4: // Invalid currency and return current botId
          botMessage = botMessages.filter(b => b.id === 5)[0].message;
          setBotId(errorBotId);
          break;
      }

      reset();
      const botResponse = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/user/addMessage`,
        {
          userId: user?._id,
          message: botMessage,
          role: 1
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      );
      setUser(botResponse.data);
      scrollToBottom();
    } catch (error) {
      console.error('error:', error)
    } finally {
      await getUser();
      scrollToBottom();
      setLoading(false);
    }
  }

  const validateNewLines = (text: string) => {
    const lines = text.split('\n');
    const newLineElements = lines.map((line, index) => (
      <p key={index}>{line}</p>
    ));
    return <div>{newLineElements}</div>;
  }

  const getCurrencyConversion = async (fromCurrency: string | null, toCurrency:string | null, amount:string | null) => {
    const conversionResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}?access_key=${process.env.REACT_APP_API_KEY}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
      {}
    );
    return conversionResponse;
  }

  return (
    <div className="Home">
      <div className="header-bar">
        <h3>Currency Chat</h3>
        <button onClick={onLogout} className='btn-primary'>
          Logout
        </button>
      </div>
      <div className="chat-body">
        <div className="chat-card">
          <div className="chat-title">
            <p>{user?.fullName}</p>
          </div>
          <div className="chat-conversation">
            {
              user && user.conversation.length > 0
                ? user.conversation.map ((message) => (
                  <div className={message?.role === 1 ? 'bot-chat': 'user-chat'} key={message.id}>
                    { validateNewLines(message.message) }
                  </div>
                ))
                : <div className='no-chat'>
                    There is not conversation yet
                  </div>
            }
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type='text'
                     placeholder="Write your message here..."
                     {...register("message", { required: true })}
                className={errors.message ? 'error-input send-input': 'send-input'}
              />
              <button
                disabled={loading}
                className="btn-send"
                type="submit">
                {loading ? '...':'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;