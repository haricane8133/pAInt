# pAInt
## About
- Built with [Pytorch](https://pytorch.org/) for [Pytorch Summer Hackathon 2020]([https://pytorch2020.devpost.com/](https://pytorch2020.devpost.com/)), pAInt can be called as an AI augmented painting tool.
- Includes a canvas forked from [JS Paint](https://github.com/1j01/jspaint) which resembles MS Paint from the windows 90s era.
- The user can sketch anything he/she wants and let AI complete the art with best in class Artistic style transfers and styling with a custom image
- The experience also involves a gallery consisting of some of the art completed by fellow artists and a cart that allows the user to simply download artwork from the application
- The app was built with a typescript backend and a VueJS front end. The Typescript backend calls Python scripts that handles the ML tasks with Pytorch.
- The repo contains two folders [/paint/](paint/) and [/paint-frontend/](paint-frontend/). These contain the code for backend and frontend respectively.
- The backend uses the folder [/paint/wwwroot/](paint/wwwroot) as the public or static directory and this is the place where the compiled distribution files of the frontend are placed.
- You may find the modified code of [JS Paint](https://github.com/1j01/jspaint) within the repo at [/paint/wwwroot/paint/](paint/wwwroot/paint).
- You may find ML based stuff and user files within [/paint/ml/](paint/ml) directory
- The video demo can be found at [this link](https://youtu.be/A6L7rqu0yIA)

## Usage
* Deploy the backend to a server with a unix based shell that supports "&&" to chain two commands together and has an NVIDIA GPU attached.
* You must have [python](https://www.python.org/) or [conda](https://docs.conda.io/) set up with all requirements as given in [/paint/ml/conda_env.yml](paint/ml/conda_env.yml) and [/paint/ml/conda_env_spec.txt](paint/ml/conda_env_spec.txt)
* Note that this project uses GIT LFS. So you'll have to install GIT LFS and fetch all the LFS files

## Authors
* [Hari. R](https://www.github.com/haricane8133)
* [Keerthan](https://github.com/keerthan2)
* [Subrahmanyam](https://github.com/Subrahmanyam2305)
