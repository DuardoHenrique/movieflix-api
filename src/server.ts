import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/", async (_, res) => {
    res.send("Página inicial");
});

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies);
});

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    console.log(title, genre_id, language_id, oscar_count, release_date);
    

    try {
        // verificar se já exixte um filme com o mesmo nome
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive"} }
        });

        if(movieWithSameTitle) {
            return res.status(409).send({message: "Já existe um filme cadastrado com esse título"});
        }

        await prisma.movie.create({
            data: {
                title: title,
                genre_id,
                language_id: language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });

    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme!" });
    }

    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    // pegar o id do registro que vai ser atualizado
    const id = Number(req.params.id);

    try{
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });
    
        if(!movie) {
            // 404 não encontrado
            return res.status(404).send({message: "Filme não encntrado"});
        }
    
        const data = {...req.body};
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
        
        // pegar os dados do filme que será atualizado e atualizar ele no prisma
        await prisma.movie.update({
            where: { id },
            data
        });
    } catch (error) {
        return res.status(500).send({message: "Falha ao atualizar o registro do filme"});
    }
    
    // retornar o status correto informado que o filme foi atualizado
    res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({ where: { id } });

        if(!movie) {
            return res.status(404).send({message: "Filme não encontrado"});
        }
    
        await prisma.movie.delete({where: { id }});
    
    } catch (error) {
        return res.status(500).send({message: "Não foi possível remover o filme"});
    }

    res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {
    // filtrar os filmes do banco pelo gênero
    try {
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: { 
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }
                }
            }
        });

        res.status(200).send(moviesFilteredByGenreName);
    } catch (error) {
        res.status(500).send({message: "Falha ao filtrar filmes por gênero"});
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta http://localhost:${port}`);
});
