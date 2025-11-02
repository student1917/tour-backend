import express from 'express'
import { createTour, updateTour, deleteTour, getSingleTour, getAllTour, 
    getTourBySearch, getFeaturedTour, getTourCount, getTourCountries, 
    getTourSubregions, getCountryByName,
    getAllVisibleTours, getTourCountsBySubregion} from '../controllers/tourController.js'
import { verifyAdmin } from '../utils/verifyToken.js'

const router = express.Router()

//create new tour
// router.post('/', verifyAdmin, createTour)
router.post('/', createTour)

//update tour
// router.put('/:id', verifyAdmin, updateTour)
router.put('/:id', updateTour)

//delete tour
// router.delete('/:id', verifyAdmin, deleteTour)
router.delete('/:id', deleteTour)

//et all tour
router.get('/', getAllTour)
//get tour by search
router.get('/search/getTourBySearch', getTourBySearch)
//get featured tour
router.get('/search/getFeaturedTour', getFeaturedTour)
//tour count
router.get('/search/getTourCount', getTourCount)
//get country
router.get('/search/getTourCountries', getTourCountries)
//get subregion
router.get('/search/getTourSubregions', getTourSubregions )
//get country by name
router.get('/country', getCountryByName)

//get visible tour
router.get('/visible', getAllVisibleTours)
//get tour counts by subregion
router.get('/subregion-count', getTourCountsBySubregion);

//get single tour
router.get('/:id', getSingleTour)

export default router
