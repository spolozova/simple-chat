// @ts-check
import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import {
  Form,
  Col,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../hooks/index.jsx';
import { addMessage } from '../slices/messagesSlicer.js';

const getMessagesList = (messages, currentId) => {
  if (messages.length === 0) {
    return null;
  }
  return messages.filter(({ channelId }) => channelId === currentId)
    .map(({ username, body, id }) => (
      <div key={id} className="text-break mb-2">
        <b>{username}</b>
        :
        {body}
      </div>
    ));
};

const Messages = () => {
  // @ts-ignore
  const { messages } = useSelector((state) => state.messagesInfo);
  // @ts-ignore
  const { channels, currentChannelId } = useSelector((state) => state.channelsInfo);
  const { name } = channels.length === 0 ? null : _.find(channels, ['id', currentChannelId]);
  const messageInputRef = useRef(null);
  const messagesListRef = useRef(null);
  const dispatch = useDispatch();
  const socket = useSocket();
  // const [state, setState] = useState(null);

  useEffect(() => {
    messageInputRef.current.focus();
    socket.on('newMessage', (newMessage) => {
      console.log(newMessage);
      dispatch(addMessage(newMessage));
    });
  }, [dispatch, socket]);

  useEffect(() => {
    const scroll = messagesListRef.current.scrollHeight - messagesListRef.current.clientHeight;
    messagesListRef.current.scrollTo(0, scroll);
  }, [messages]);

  // const withTimeout = (onSuccess, onTimeout, timeout) => {
  //   const timer = setTimeout(() => {
  //     if (state === 'sent') return;
  //     onTimeout();
  //   }, timeout);

  //   return () => {
  //     clearTimeout(timer);
  //     onSuccess();
  //   };
  // };

  const formik = useFormik({
    initialValues: {
      body: '',
    },
    onSubmit: ({ body }) => {
      const { username } = JSON.parse(localStorage.getItem('userId'));
      const outgoingMessage = {
        body,
        channelId: currentChannelId,
        username,
      };
      socket.emit('newMessage', outgoingMessage, (response) => {
        if (response.status === 'ok') {
          formik.resetForm();
          messageInputRef.current.focus();
        }
      });
    },
  });

  return (
    <Col className="col p-0 h-100">
      <div className="d-flex flex-column h-100">
        <div className="bg-light mb-4 p-3 shadow-sm small">
          <p className="m-0">
            <b>
              #
              {name}
            </b>
          </p>
          <span className="text-muted">сообщения</span>
        </div>
        <div id="message-box" className="chat-messages overflow-auto px-5" ref={messagesListRef}>
          {getMessagesList(messages, currentChannelId)}
        </div>
        <div className="border-top mt-auto py-3 px-5">
          <Form onSubmit={formik.handleSubmit}>
            <InputGroup>
              <FormControl
                required
                ref={messageInputRef}
                name="body"
                data-testid="new-message"
                placeholder="Введите сообщение..."
                className="border-0"
                value={formik.values.body}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
              />
              <button className="btn btn-group-vertical" type="submit" disabled={formik.isSubmitting}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-arrow-right-square" viewBox="0 0 16 16">
                  <path d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                </svg>
              </button>
            </InputGroup>
          </Form>
        </div>
      </div>
    </Col>
  );
};

export default Messages;