import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id as Id;
  const cuboid = await Cuboid.query().findById(id).withGraphFetched('bag');
  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  return res.status(HttpStatus.OK).json(cuboid);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId);

  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const volumeCuboid = depth * width * height;

  if (volumeCuboid >= 504) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as Id;
  const { newWidth, newHeight, newDepth, newBagId } = req.body;

  const volumeCuboid = newWidth * newHeight * newDepth;

  if (volumeCuboid === 216) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const updateCuboid = await Cuboid.query().updateAndFetchById(id, {
    width: newWidth,
    height: newHeight,
    depth: newDepth,
    bagId: newBagId,
  });

  return res.status(HttpStatus.OK).json(updateCuboid);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as Id;

  const cuboid = await Cuboid.query().findById(id);
  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const response = await Cuboid.query().deleteById(id);
  return res.status(HttpStatus.OK).json(response);
};
