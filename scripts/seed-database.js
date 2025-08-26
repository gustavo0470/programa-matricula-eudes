const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const cursos = [
  {
    name: 'Informática Básica',
    description: 'Curso de introdução à informática, incluindo Word, Excel e navegação na internet.'
  },
  {
    name: 'Artesanato e Trabalhos Manuais',
    description: 'Oficina de artesanato com diversos materiais: crochê, tricô, pintura e decoração.'
  },
  {
    name: 'Culinária e Confeitaria',
    description: 'Curso prático de culinária básica e técnicas de confeitaria para iniciantes.'
  }
];

const nomesMasculinos = ['João', 'Pedro', 'Carlos', 'Antonio', 'José', 'Francisco', 'Daniel', 'Rafael', 'Lucas', 'Felipe'];
const nomesFemininos = ['Maria', 'Ana', 'Francisca', 'Antonia', 'Adriana', 'Juliana', 'Marcia', 'Sandra', 'Patricia', 'Claudia'];
const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida'];
const bairros = ['Centro', 'Vila Nova', 'Jardim das Flores', 'Parque Industrial', 'Vila São José', 'Residencial Portal', 'Conjunto Habitacional', 'Vila Santa Rita'];
const ruas = ['Rua das Flores', 'Avenida Central', 'Rua São José', 'Rua da Paz', 'Avenida Brasil', 'Rua Amazonas', 'Rua Paraná', 'Rua Minas Gerais'];

function gerarNomeCompleto() {
  const genero = Math.random() > 0.5 ? 'M' : 'F';
  const nomes = genero === 'M' ? nomesMasculinos : nomesFemininos;
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome1 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  const sobrenome2 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  
  return {
    nome: `${nome} ${sobrenome1} ${sobrenome2}`,
    genero
  };
}

function gerarDataNascimento() {
  const anoAtual = new Date().getFullYear();
  const anoNascimento = anoAtual - Math.floor(Math.random() * 60 + 16); // 16 a 76 anos
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  
  return new Date(anoNascimento, mes - 1, dia);
}

function gerarTelefone() {
  const ddd = Math.random() > 0.5 ? '17' : '16'; // DDDs da região
  const numero = Math.floor(Math.random() * 100000000) + 900000000;
  return `(${ddd}) 9${numero.toString().substring(1)}`;
}

function gerarEndereco() {
  const rua = ruas[Math.floor(Math.random() * ruas.length)];
  const numero = Math.floor(Math.random() * 999) + 1;
  const bairro = bairros[Math.floor(Math.random() * bairros.length)];
  const cep = `15${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}`;
  
  return { rua, numero, bairro, cep };
}

function gerarHorarios() {
  const horarios = [
    ['08:00 - 10:00'],
    ['10:00 - 12:00'],
    ['14:00 - 16:00'],
    ['16:00 - 18:00'],
    ['08:00 - 10:00', '14:00 - 16:00'],
    ['19:00 - 21:00']
  ];
  
  return horarios[Math.floor(Math.random() * horarios.length)];
}

function gerarDiasSemana() {
  const opcoes = [
    ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    ['TUESDAY', 'THURSDAY'],
    ['SATURDAY'],
    ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    ['TUESDAY'],
    ['FRIDAY'],
    ['MONDAY', 'WEDNESDAY'],
    ['THURSDAY', 'FRIDAY']
  ];
  
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

async function criarAluno(numeroMatricula, cursoId) {
  const pessoa = gerarNomeCompleto();
  const endereco = gerarEndereco();
  const dataNascimento = gerarDataNascimento();
  const telefone = gerarTelefone();
  
  const aluno = await prisma.student.create({
    data: {
      enrollment: `GASI ${numeroMatricula.toString().padStart(3, '0')}/2025`,
      name: pessoa.nome,
      documentType: Math.random() > 0.5 ? 'RG' : 'CIN',
      documentNumber: (Math.floor(Math.random() * 90000000) + 10000000).toString(),
      cpf: Math.random() > 0.3 ? `${Math.floor(Math.random() * 900000000) + 100000000}${Math.floor(Math.random() * 90) + 10}` : null,
      birthDate: dataNascimento,
      fatherName: Math.random() > 0.4 ? gerarNomeCompleto().nome : null,
      motherName: gerarNomeCompleto().nome,
      address: `${endereco.rua}, ${endereco.numero}`,
      neighborhood: endereco.bairro,
      zipCode: endereco.cep,
      state: 'SP',
      city: 'Indiaporã',
      phone: telefone,
      email: `${pessoa.nome.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      imageRights: Math.random() > 0.2,
      hasAllergies: Math.random() > 0.8,
      allergyDescription: Math.random() > 0.8 ? 'Alergia a amendoim' : null,
      status: Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE'
    }
  });
  
  // Criar matrícula no curso
  const matricula = await prisma.enrollment.create({
    data: {
      studentId: aluno.id,
      courseId: cursoId,
      weekdays: gerarDiasSemana(),
      schedule: gerarHorarios().join(', '),
      status: aluno.status === 'ACTIVE' ? 'ACTIVE' : 'CANCELLED'
    }
  });
  
  return { aluno, matricula };
}

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');
    
    // Limpar dados existentes
    console.log('🔄 Limpando dados existentes...');
    await prisma.enrollment.deleteMany({});
    await prisma.documentUpload.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.course.deleteMany({});
    
    console.log('✅ Dados limpos com sucesso!\n');
    
    // Criar cursos
    console.log('📚 Criando cursos...');
    const cursosCreated = [];
    
    for (const curso of cursos) {
      const cursoCriado = await prisma.course.create({
        data: curso
      });
      cursosCreated.push(cursoCriado);
      console.log(`   ✅ Curso criado: ${cursoCriado.name}`);
    }
    
    console.log(`\n👥 Criando 5 alunos para cada curso...`);
    
    let numeroMatricula = 1;
    let totalAlunos = 0;
    let totalMatriculas = 0;
    
    for (const curso of cursosCreated) {
      console.log(`\n📖 Criando alunos para: ${curso.name}`);
      
      for (let i = 0; i < 5; i++) {
        const { aluno, matricula } = await criarAluno(numeroMatricula, curso.id);
        console.log(`   ✅ ${numeroMatricula.toString().padStart(3, '0')}/2025 - ${aluno.name}`);
        
        numeroMatricula++;
        totalAlunos++;
        totalMatriculas++;
      }
    }
    
    // Criar alguns documentos de exemplo
    console.log('\n📄 Criando documentos de exemplo...');
    const alunosComDocumentos = await prisma.student.findMany({
      take: 3
    });
    
    for (const aluno of alunosComDocumentos) {
      await prisma.documentUpload.createMany({
        data: [
          {
            studentId: aluno.id,
            documentType: 'BIRTH_CERTIFICATE',
            filename: 'Certidão de Nascimento',
            fileUrl: '',
            fileType: 'physical',
            isSubmitted: true
          },
          {
            studentId: aluno.id,
            documentType: 'ADDRESS_PROOF',
            filename: 'Comprovante de Endereço',
            fileUrl: '',
            fileType: 'physical',
            isSubmitted: true
          }
        ]
      });
    }
    
    console.log('✅ Documentos de exemplo criados!');
    
    // Resumo final
    console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log(`✅ Cursos criados: ${cursosCreated.length}`);
    console.log(`✅ Alunos criados: ${totalAlunos}`);
    console.log(`✅ Matrículas criadas: ${totalMatriculas}`);
    console.log(`✅ Documentos criados: ${alunosComDocumentos.length * 2}`);
    
    console.log('\n📊 Distribuição por curso:');
    for (const curso of cursosCreated) {
      const count = await prisma.enrollment.count({
        where: { courseId: curso.id }
      });
      console.log(`   📚 ${curso.name}: ${count} alunos`);
    }
    
    console.log('\n🚀 Próximo passo: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };