import React, { useState, useRef, useEffect } from "react";
import Card from "react-bootstrap/Card";
import axios from "axios";
import "./App.css";
import ListGroup from "react-bootstrap/ListGroup";
import CloseButton from "react-bootstrap/CloseButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import toast from 'react-hot-toast'

function Reducer() {
  const initialState = {
    input: "",
    todos: [],
    editingTodoId: null,
    doubleClick: false,
  };

  const [state, setState] = useState(initialState);
  const inputRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://strapi-production-456d.up.railway.app/api/todos")
      .then((res) => {
        console.log("API Response:", res);
        setState((prevState) => ({
          ...prevState,
          todos: res.data.data.map((todo) => ({
            id: todo.id,
            task: todo.attributes.data,
            completed: todo.attributes.status,
            lastUpdate: todo.attributes.updatedAt, // Added lastUpdate field
          })),
        }));
      })
      .catch((error) => {
        console.error("Error fetching todos:", error);
      });
  }, []);

  const createTodo = () => {
    if (state.input.trim() !== "") {
      axios
        .post("https://strapi-production-456d.up.railway.app/api/todos", {
          data: { data: state.input, status: false },
        })
        .then((res) => {
          setState((prevState) => ({
            ...prevState,
            todos: [
              ...prevState.todos,
              {
                id: res.data.data.id,
                task: state.input,
                completed: false,
                lastUpdate: res.data.data.attributes.updatedAt, // Added lastUpdate field
              },
            ],
            input: "",
          }));
          toast.success("Todo is created");
        }
       
        )
        .catch((error) => console.error("Error creating todo:", error));
    }
  };

  const updateTodo = (id, task) => {
    axios
      .put(`https://strapi-production-456d.up.railway.app/api/todos/${id}`, {
        data: {
          data: task,
          status: state.todos.find((todo) => todo.id === id).completed,
        },
      })
      .then(() => {
        setState((prevState) => ({
          ...prevState,
          todos: prevState.todos.map(
            (todo) =>
              todo.id === id ? { ...todo, task, lastUpdate: new Date() } : todo // Updated lastUpdate field
          ),
          editingTodoId: null,
        }));
      })
      .catch((error) => console.error("Error updating todo:", error));
  };

  const deleteTodo = (id) => {
    axios
      .delete(`https://strapi-production-456d.up.railway.app/api/todos/${id}`)
      .then(() => {
        setState((prevState) => ({
          ...prevState,
          todos: prevState.todos.filter((todo) => todo.id !== id),
        }));
        toast('Todo Deleted!', {
          icon: '🗑️',
        });
      }
      )
      .catch((error) => console.error("Error deleting todo:", error));
  };

  const handleAddTodo = () => {
    createTodo();
  };

  const handleDeleteTodo = (id) => {
    deleteTodo(id);
  };

  const handleToggleComplete = (id) => {
    const todoToUpdate = state.todos.find((todo) => todo.id === id);
    const updatedStatus = !todoToUpdate.completed;

    axios
      .put(`https://strapi-production-456d.up.railway.app/api/todos/${id}`, {
        data: { data: todoToUpdate.task, status: updatedStatus },
      })
      .then(() => {
        setState((prevState) => ({
          ...prevState,
          todos: prevState.todos.map(
            (todo) =>
              todo.id === id
                ? { ...todo, completed: updatedStatus, lastUpdate: new Date() }
                : todo // Updated lastUpdate field
          ),
        }));
      })
      .catch((error) => console.error("Error updating todo:", error));
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setState((prevState) => ({
      ...prevState,
      input: value,
    }));
  };

  const handleUpdate = (id, task) => {
    setState((prevState) => ({
      ...prevState,
      editingTodoId: id,
      input: task,
    }));
  };

  const handleDoubleClick = (id) => {
    setState((prevState) => ({
      ...prevState,
      doubleClick: true,
    }));

    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        doubleClick: false,
      }));
    }, 300);
  };

  const handleItemClick = (id) => {
    if (state.doubleClick) {
      // Double-click action (Toggle Edit mode)
      handleUpdate(id, state.todos.find((todo) => todo.id === id).task);
    } else {
      // Single-click action (Toggle Complete/Undo)
      handleToggleComplete(id);
    }

    // Sort todos by lastUpdate in descending order
    setState((prevState) => ({
      ...prevState,
      todos: prevState.todos.sort(
        (a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate)
      ),
    }));
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Form className="my-4 w-50">
        <Row>
          <Col sm={8} className="mb-2">
            <Form.Group
              controlId="exampleForm.ControlInput1"
            >
              <Form.Control
                type="text"
                placeholder="Enter your Todo task"
                value={state.input}
                onChange={handleInputChange}
                ref={inputRef}
              />
            </Form.Group>
          </Col>
          <Col sm={4} >
            <Button
            className="w-100"
              onClick={handleAddTodo}
              variant="secondary"
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form>

      <div>
        <ListGroup sm={8}>
          {state.todos.map((todo) => (
            <ListGroup.Item
              key={todo.id}
              action
              variant="info"
              onClick={() => handleItemClick(todo.id)}
              onDoubleClick={() => handleDoubleClick(todo.id)}
              style={{maxWidth:"90vw"}}
              className="mb-2"
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {state.editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={state.input}
                    onChange={handleInputChange}
                    ref={inputRef}
                    autoFocus // Set autoFocus here to focus the input field when in edit mode
                  />
                ) : (
                  <h3
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                     lineBreak:"anywhere"
                    }}
                  >
                    {todo.task}
                  </h3>
                )}
                <div>
                  <CloseButton
                    className="delButton"
                    onClick={() => handleDeleteTodo(todo.id)}
                    style={{ marginLeft: "175px" }}
                  />
                  <Card
                    style={{
                      marginBottom: "-30px",
                      paddingTop: "-80px",
                      marginRight: "-16px",
                    }}
                  >
                    <Card.Body>{todo.lastUpdate.toLocaleString()}</Card.Body>
                  </Card>
                </div>
              </div>
              {state.editingTodoId === todo.id ? (
                <>
                  <button onClick={() => updateTodo(todo.id, state.input)}>
                    Save
                  </button>
                  <button
                    onClick={() =>
                      setState((prevState) => ({
                        ...prevState,
                        editingTodoId: null,
                      }))
                    }
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    onClick={() => handleUpdate(todo.id, todo.task)}
                    icon={faPenToSquare}
                  />
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default Reducer;
