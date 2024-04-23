const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUsers = async () => {
  const user1 = await prisma.user.create({
    data: {
      username: "almightyjoe",
      password: "almightpword",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      username: "mellothumbs",
      password: "swansong",
    },
  });
  const user3 = await prisma.user.create({
    data: {
      username: "deladuffy",
      password: "vivachile",
    }
  })
}

const createPosts = async () => {
  const post1 = await prisma.post.create({
    data: {
      title: "earthquake in nyc!!",
      content: "in nyc? man i've seen it all @_@",
      userId: 2
    },
  });
  const post2 = await prisma.post.create({
    data: {
      title: "best places in the city to eat?",
      content: "koku ramen, peter lugers, and any five guys",
      userId: 1
    },
  });
  const post3 = await prisma.post.create({
    data: {
      title: "my 2024 so far",
      content: "a lot of working, stressing, and not much else!",
      userId: 3
    }
  })
}

const main = async () => {
  await createUsers();
  await createPosts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });