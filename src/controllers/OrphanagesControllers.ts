import { Request, Response } from 'express';

import { getRepository } from 'typeorm';

import * as Yup from 'yup';

import orphanageView from '../views/orphanages_view';

import Orphanage from '../models/Orphanage';

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    });

    return response.json(orphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    });

    return response.json(orphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;
  
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map(image => {
      return { path: image.filename }
    })

    const data = {
        name,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends: open_on_weekends === 'true',
        images
    };

    const schema = Yup.object().shape({
      name: Yup.string().required('O campo de nome deve ser preenchido, obrigatoriamente.'),
      latitude: Yup.number().required('O campo de latitude deve ser deve ser preenchido, obrigatoriamente.'),
      longitude: Yup.number().required('O campo de longitude deve ser deve ser preenchido, obrigatoriamente.'),
      about: Yup.string().required('O campo sobre deve ser deve ser preenchido, obrigatoriamente.').max(300),
      instructions: Yup.string().required('O campo de instruções deve ser deve ser preenchido, obrigatoriamente.'),
      opening_hours: Yup.string().required('O campo de hora de funcionamento deve ser deve ser preenchido, obrigatoriamente.'),
      open_on_weekends: Yup.boolean().required('O campo de abertura nos fins de semana deve ser deve ser preenchido, obrigatoriamente.'),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required()
       })
      )
    });

    await schema.validate(data, {
      abortEarly: false,
    });
  
    const orphanage = orphanagesRepository.create(data);
    
    await orphanagesRepository.save(orphanage);
  
    return response.status(201).json(orphanage);
  }
}