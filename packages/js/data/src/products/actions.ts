/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import TYPES from './action-types';
import { WC_PRODUCT_NAMESPACE } from './constants';
import { PartialProduct, Product, ProductQuery } from './types';

export function getProductSuccess( id: number, product: PartialProduct ) {
	return {
		type: TYPES.GET_PRODUCT_SUCCESS as const,
		id,
		product,
	};
}

export function getProductError(
	query: Partial< ProductQuery >,
	error: unknown
) {
	return {
		type: TYPES.GET_PRODUCT_ERROR as const,
		query,
		error,
	};
}

export function getProductsSuccess(
	query: Partial< ProductQuery >,
	products: PartialProduct[],
	totalCount: number
) {
	return {
		type: TYPES.GET_PRODUCTS_SUCCESS as const,
		products,
		query,
		totalCount,
	};
}

export function getProductsError(
	query: Partial< ProductQuery >,
	error: unknown
) {
	return {
		type: TYPES.GET_PRODUCTS_ERROR as const,
		query,
		error,
	};
}

export function getProductsTotalCountSuccess(
	query: Partial< ProductQuery >,
	totalCount: number
) {
	return {
		type: TYPES.GET_PRODUCTS_TOTAL_COUNT_SUCCESS as const,
		query,
		totalCount,
	};
}

export function getProductsTotalCountError(
	query: Partial< ProductQuery >,
	error: unknown
) {
	return {
		type: TYPES.GET_PRODUCTS_TOTAL_COUNT_ERROR as const,
		query,
		error,
	};
}

export function updateProductSuccess( id: number, product: PartialProduct ) {
	return {
		type: TYPES.UPDATE_PRODUCT as const,
		id,
		product,
	};
}

export function updateProductError(
	id: number,
	query: Partial< ProductQuery >,
	error: unknown
) {
	return {
		type: TYPES.UPDATE_PRODUCT_ERROR as const,
		id,
		query,
		error,
	};
}

export function setIsRequesting( isRequesting: boolean, id: number ) {
	return {
		type: TYPES.SET_IS_REQUESTING as const,
		id,
		isRequesting,
	};
}

export function* removeProduct( id: number, query: Partial< ProductQuery > ) {
	yield setIsRequesting( true, id );

	try {
		const url = addQueryArgs( `${ WC_PRODUCT_NAMESPACE }/${ id }`, query );

		const product: Product = yield apiFetch( {
			path: url,
			method: 'DELETE',
		} );

		if ( product ) {
			yield updateProductSuccess( id, product );
			return product;
		}

		throw new Error();
	} catch ( error ) {
		yield updateProductError( id, query, error );
		throw new Error();
	}
}

export type Actions = ReturnType<
	| typeof getProductSuccess
	| typeof getProductError
	| typeof getProductsSuccess
	| typeof getProductsError
	| typeof getProductsTotalCountSuccess
	| typeof getProductsTotalCountError
	| typeof updateProductSuccess
	| typeof updateProductError
	| typeof setIsRequesting
>;
