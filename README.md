# Pizzaria

## 👥 Integrantes da Dupla
- André Gustavo Pavanelli
- João Victor
                                                    


## 📖 Descrição do Projeto
Este projeto consiste no desenvolvimento de uma aplicação fullstack de uma pizzaria que cria e consulta o proprio banco de dados e API para a anotação e confirmação de pedidos dessa pizzaria além de ter uma aba propria para o garçom, atendente e adm. 

Garçom- É capaz de anotar os pedidos e visualizar suar respectivas mesas🍷

Atendente - Controle de gastos e acompanhamento dos pedidos💰

ADM - Controle de gastos e senhas dos funcionarios💻



A aplicação permite: 
- realizar pedidos 
- Guardar esses pedidos em um banco de dados proprio
- calcular o faturamento
- mostrar o numero de: Clientes & Pizzas

## 💻 Tecnologias Utilizadas

### Backend
- Node.js
- Express
- sqlite
- json web token
- bcryptjs
- cors
- dotenv

#grande parte dessas tecnologias são bibliotecas ou frameworks que ajudam nas funcionalidades e segurança do site
  

### Frontend
- HTML 
- CSS 
- JavaScript



## ⚙️ Como Executar o Backend

1. Clone o repositório(git clone)
2. verificar se a ordem das pasta está correta
pastas:
<img width="250" height="557" alt="unnamed" src="https://github.com/user-attachments/assets/85606aeb-a6c4-48f3-9ac6-a5e9e0a43594" />


3. npm install express
4. npm install sql.js
5. npm install jsonwebtoken
6. npm install bcryptjs
7. npm install cors
8. npm install dotenv

9. popular o banco de dados com o comando (node seed.js)

adicionar . env com
11. PORT=3001

12. DB_PATH=./pizzaria.db
13. JWT_SECRET=senha123456




14. iniciar o servidor (node index.js)

15. Acesse http://localhost:3001 no navegador.

tela de login:
<img width="1919" height="943" alt="unnamed" src="https://github.com/user-attachments/assets/40dcb08d-5973-4b0f-bd5b-be6d83685001" />


tela logada:
<img width="1919" height="935" alt="unnamed" src="https://github.com/user-attachments/assets/cd8049e8-907e-4055-bc77-2887b5bf1dfc" />


## 📁Estrutura de pastas

<img width="250" height="557" alt="unnamed" src="https://github.com/user-attachments/assets/85606aeb-a6c4-48f3-9ac6-a5e9e0a43594" />


- /public → Frontend (HTML, CSS, JS) 
- /src /database → Conexão com o banco (SQLite)
- /routes → Definição das rotas da API 
-  /middleware → Middlewares (ex: conexão com banco) 
- /models → Entidades e regras de negócio 
- index.js → Arquivo principal do servidor
- .env → Variáveis de ambiente
- pizzaria.db → Banco de dados 
- SQLite seed.js → Popula o banco com dados iniciais



## 👀Funcionlidades e como testalas


1. Login por função

<img width="919" height="343" alt="unnamed" src="https://github.com/user-attachments/assets/2e5ffb4e-813d-4f5b-9e0e-4c6907036724" />

-para iniciar o site basta colocar o login e senha pré cadastrado.



2. Fazer pedido
<img width="720" height="698" alt="unnamed" src="https://github.com/user-attachments/assets/6221696f-e190-45ed-b764-1f49bff249ad" />

-para anotar um pedido basta ir em pedidos e depois clickar em "+ Novo pedido".



3. Acompanhamento financeiro / pedidos
<img width="1919" height="563" alt="unnamed" src="https://github.com/user-attachments/assets/6c06a5e7-42ce-4e8f-88fe-d12b3526b609" />

-após fazer um pedido é possivel vizualizalos juntamente com o dinheiro total recebido por eles.



4. Cadastro clientes
<img width="1797" height="417" alt="unnamed" src="https://github.com/user-attachments/assets/10c7f701-68c9-4060-bc2c-35793ba9af1c" />

-o seeds que cria um banco de dados pré preenchido cria alguns usuarios existentes sendo possivel ve-los na aba pedidos ou clientes.



5. Funções
<img width="1677" height="278" alt="unnamed" src="https://github.com/user-attachments/assets/0a1b90db-c05a-4d2b-b1a2-2a0d79bb3eaf" />
-É possivel cadastrar novos logins para funcionarios ou alterar a senha dos que á existem.



## Credenciais de  teste🔑
- Administrador                   
-login: admin@pizzaria.com        
-senha: 123456                    
                                  

                                  
- Atendente                       
-login: atendente@pizzaria.com    
-senha: 123456                    

                                  
- Garçom                          
-login: garcom@pizzaria.com       
-senha: 123456                    
                                  






## Desafios🤯
O nosso maior desafio foi o entendimento e a pratica de instalação das Bibliotecas e Frameworks e o unico jeito de realmente cnseguir foi na base da tentativa e erro. No final tudo ficou mais claro quando pensamos na instalação das mesmas em uma unica pasta "CHEFE". Outro problema solucionado logo após realizarmos a instalação correta de tudo foi colocar o servidor para rodar o que acabou sendo facilmente solucionado.


## Melhorias futuras

Oque sem duvidas pode ser melhorado é a adição de imagens para deixar uma interface mais dinamica e de facil atendimento.
