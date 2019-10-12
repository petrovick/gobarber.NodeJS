require('dotenv/config');

// nao usando import/export pq eh utilziado fora da aplicacao pelo sequelize-cli, via linha de comando e nao conhece o impor/exports
module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // Coluna created_at e updated_at criada por padrao
    underscored: true, // Garante o padrao de criacao de tabelas e colunas
    underscoredAll: true, // Garante o padrao de criacao de tabelas e colunas(Uuser_groups ao inves de UserGroups)
  },
};
