import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
// Nao eh um reflexo do campo do banco de dados
class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    // Hooks: Executa acoes no model com base em algum evento(antes de salvar, depois de salvar, etc...)

    return this;
  }
}

export default File;
