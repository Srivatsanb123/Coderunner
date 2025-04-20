# 🧠 Code Runner Web App

## A Full-stack code runner web application that allows users to write, execute, and test code in multiple languages through a modern frontend and Python-based backend API. Dockerized for smooth local and production deployment.

## 🚀 Features

- 🧑‍💻 Code editor with support for multiple languages (Python, C++, C, Java, Javascript)
- 📡 Backend API to compile/run code in a sandboxed environment
- 🐳 Fully dockerized setup for seamless development & deployment
- 🎨 Beautiful UI with theme options and responsive design
- 📄 Save you code as a file or Load code to the editor from a file
- 🤦‍♂️ Code saving in localstorage to protect your work during any issues

---

## 🛠️ Getting Started

### 🔧 Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🐳 Running the App with Docker Compose

```bash
docker-compose up --build
```

This command:

- Builds both the `frontend` and `backend` images.
- Runs them as containers.
- Connects them through a Docker network.
  > By default, the frontend runs on `http://localhost:5173`, and the backend on `http://localhost:5000`.

---

## 📅 API Overview (Backend)

**POST** `http://localhost:5000/`
**Request Body (JSON)**:

```json
{
  "language": "python",
  "code": "print('Hello World')",
  "input": "optional input string",
  "key": "your_api_key"
}
```

**Response**:

```json
{
  "output": "Hello World\n",
  "error": ""
}
```

## The backend runs the code securely and returns the output/error.

## 🌐 Frontend Overview

Built with **Vite** and **React**, the frontend provides:

- Code editor interface (powered by `react-ace`)
- Theme toggles (dark/light)
- Save/Load code in/from file
- Multiple test case support

---

## ⚙️ Environment Variables

### `frontend/.env`

```env
VITE_API_URL=http://127.0.0.1:5000
VITE_API_KEY=your_api_key
```

## Update this if you deploy to another host or port.

## 👥 Contributing

Contributions are welcome! Follow the steps below to get started:

1. **Fork** this repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit and push:
   ```bash
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request**

---

## 🙌 Acknowledgements

- [Docker](https://www.docker.com/)
- [Flask](https://flask.palletsprojects.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [react-ace](https://www.npmjs.com/package/react-ace)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📬 Contact

Created by **Srivatsan B**  
📧 Email: srivatsanb123@gmail.com
