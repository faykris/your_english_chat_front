import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import './Home.css';
import ReactPlayer from 'react-player/youtube'
import { io, Socket } from 'socket.io-client';

type userObject = {
  _id: string,
  fullname: string,
  username: string,
  password: string,
  isModerator: boolean,
  createdAt: Date,
  updatedAt: Date,
  __v: number
}

type classroomObject = {
  _id: string,
  title: string,
  description: string,
  videoUrl: string,
  conversation: any[],
  createdAt: Date,
  updatedAt: Date,
  __v: number
}

type Inputs = {
  message: string
}


const Home: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<userObject | null>(null);
  const [classroom, setClassroom] = useState<classroomObject | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Inputs>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACK_URL as string, { transports: ['websocket', 'polling']})
    setSocket(newSocket)

    newSocket.on('receiveMessage', (message: any) => {
      console.log('message', message)
      setClassroom(message);
      scrollToBottom();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    getUser()
      .then((res) => {
        setUser(res);
      })
      .catch(async (err) => {
        console.error(err);
        onLogout();
      });

    getAllClassrooms()
      .then((res) =>{
        setClassroom(res[0]);
        scrollToBottom();
      })
  },[]);

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

  const getAllClassrooms = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACK_URL}/classroom`,
      {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
      }
    );

    return response?.data;
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const classroomResponse = await axios.post(
        `${process.env.REACT_APP_BACK_URL}/user/add_message`,
        {
          classroomId: classroom?._id,
          username: user?.username,
          isModerator: user?.isModerator || false,
          message: data.message.trim(),
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      );
      setClassroom(classroomResponse?.data);
      socket?.emit('sendMessage', classroomResponse.data);
      reset();
      scrollToBottom();
    } catch (error) {
      console.error('error:', error)
    } finally {
      await getAllClassrooms();
      scrollToBottom();
      setLoading(false);
    }
  }

  const formatHour = (stringDate: string) => {
    const date = new Date(stringDate);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const period = hours >= 12 ? 'p.m.': 'a.m.';

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + formattedMinutes + ' ' + period;
  }

  return (
    <div className="Home">
      <div className="header-bar">
        <h3>Your English</h3>
        <button onClick={onLogout} className='btn-primary'>
          Logout
        </button>
      </div>
      <div className="chat-body">
        <div className="chat-video">
          <ReactPlayer url={classroom?.videoUrl} controls={true} width='100%' height='100%' />
        </div>
        <div className="chat-card">
          <div className="chat-title">
            <p>{user?.fullname}</p>
          </div>
          <div className="chat-conversation">
            {
              classroom && classroom.conversation.length > 0
                ? classroom.conversation.map ((message) => (
                  <div className={message?.username !== user?.username ? 'bot-chat': 'user-chat'} key={message.id}>
                    <p key={message.id} className='username'>{message.username} { message?.isModerator ? <span>Moderator</span> : '' }</p>
                    { message.message }
                    <div className='hour'>
                      { formatHour(message.createdAt) }
                    </div>
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
                     placeholder="Type your message here..."
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

        <div className="class-info">
          <h1>{classroom?.title}</h1>
          <hr />
          <p>{classroom?.description}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;