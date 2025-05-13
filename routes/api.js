const express = require('express');
const router = express.Router();

const brandsRouter = require('./BrandsRoutes');
const collectionsRouter = require('./CollectionsRoutes');
const usersRouter = require('./UsersRoutes');
const productsRouter = require('./ProductsRoutes');

router.use('/brands', brandsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);

module.exports = router; 