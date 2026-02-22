import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('Введите новую задачу и нажмите Enter...');
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);

  const STORAGE_KEY = 'todo_tasks';

  const updatePlaceholder = () => {
    const width = window.innerWidth;

    if (width <= 280) {
      setPlaceholder('Новая задача...');
    } else if (width <= 320) {
      setPlaceholder('Добавить задачу...');
    } else if (width <= 375) {
      setPlaceholder('Введите задачу...');
    } else if (width <= 480) {
      setPlaceholder('Новая задача (Enter)...');
    } else {
      setPlaceholder('Введите новую задачу и нажмите Enter...');
    }
  };

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        } else {
          setTasks([]);
        }
      } catch (e) {
        setTasks([]);
      }
    } else {
      setTasks([]);
    }

    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    inputRef.current?.focus();
    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', updatePlaceholder);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const editTask = (taskId, newText) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, text: newText } : task
      )
    );
  };

  const clearAllTasks = () => {
    if (window.confirm('Удалить все задачи?')) {
      setTasks([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div id="wrapper">
      <input
        ref={inputRef}
        id="input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
      />

      {tasks.length === 0 ? (
        <ul id="list" className="empty"></ul>
      ) : (
        <ul id="list">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))}
        </ul>
      )}

      {tasks.length > 0 && (
        <div className="task-stats">
          <span>📊 Всего: {totalTasks}</span>
          <span>✅ Выполнено: {completedTasks}</span>
          <button id="clearAll" onClick={clearAllTasks}>
            Очистить всё
          </button>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && editValue.trim()) {
      onEdit(task.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleEditBlur = () => {
    if (editValue.trim()) {
      onEdit(task.id, editValue.trim());
    } else {
      setEditValue(task.text);
    }
    setIsEditing(false);
  };

  return (
    <li>
      <span
        className={`task ${task.completed ? 'done' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleEditChange}
            onKeyPress={handleEditKeyPress}
            onBlur={handleEditBlur}
          />
        ) : (
          task.text
        )}
      </span>

      <span
        className="mark"
        onClick={() => onToggle(task.id)}
      >
        ✓
      </span>

      <span
        className="remove"
        onClick={() => onDelete(task.id)}
      >
        ✗
      </span>
    </li>
  );
}

export default App;