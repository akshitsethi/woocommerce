/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Button, Card, Spinner, Tooltip } from '@wordpress/components';
import {
	EXPERIMENTAL_PRODUCT_VARIATIONS_STORE_NAME,
	ProductVariation,
} from '@woocommerce/data';
import { ListItem, Pagination, Sortable, Tag } from '@woocommerce/components';
import { useContext, useState } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import HiddenIcon from '~/products/images/hidden-icon';
import VisibleIcon from '~/products/images/visible-icon';
import { CurrencyContext } from '../../../lib/currency-context';
import {
	getProductStockStatus,
	getProductStockStatusClass,
} from '../../utils/get-product-stock-status';
import './variations.scss';

/**
 * Since the pagination component does not exposes the way of
 * changing the per page options which are [25, 50, 75, 100]
 * the default per page option will be the min in the list to
 * keep compatibility.
 *
 * @see https://github.com/woocommerce/woocommerce/blob/trunk/packages/js/components/src/pagination/index.js#L12
 */
const DEFAULT_PER_PAGE_OPTION = 25;

const NOT_VISIBLE_TEXT = __( 'Not visible to customers', 'woocommerce' );
const VISIBLE_TEXT = __( 'Visible to customers', 'woocommerce' );
const UPDATING_TEXT = __( 'Updating product variation', 'woocommerce' );

export const Variations: React.FC = () => {
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE_OPTION );
	const [ isUpdating, setIsUpdating ] = useState< Record< string, boolean > >(
		{}
	);
	const { productId } = useParams();
	const context = useContext( CurrencyContext );
	const { formatAmount, getCurrencyConfig } = context;
	const { isLoading, variations, totalCount } = useSelect(
		( select ) => {
			const {
				getProductVariations,
				hasFinishedResolution,
				getProductVariationsTotalCount,
			} = select( EXPERIMENTAL_PRODUCT_VARIATIONS_STORE_NAME );
			const requestParams = {
				product_id: productId,
				page: currentPage,
				per_page: perPage,
			};
			return {
				isLoading: ! hasFinishedResolution( 'getProductVariations', [
					requestParams,
				] ),
				variations:
					getProductVariations< ProductVariation[] >( requestParams ),
				totalCount:
					getProductVariationsTotalCount< number >( requestParams ),
			};
		},
		[ currentPage, perPage ]
	);

	const { updateProductVariation } = useDispatch(
		EXPERIMENTAL_PRODUCT_VARIATIONS_STORE_NAME
	);

	if ( ! variations || isLoading ) {
		return (
			<Card className="woocommerce-product-variations is-loading">
				<Spinner />
			</Card>
		);
	}

	const currencyConfig = getCurrencyConfig();

	function handleCustomerVisibilityClick(
		variationId: number,
		status: 'private' | 'publish'
	) {
		if ( isUpdating[ variationId ] ) return;
		setIsUpdating( ( prevState ) => ( {
			...prevState,
			[ variationId ]: true,
		} ) );
		updateProductVariation< Promise< ProductVariation > >(
			{ product_id: productId, id: variationId },
			{ status }
		).finally( () =>
			setIsUpdating( ( prevState ) => ( {
				...prevState,
				[ variationId ]: false,
			} ) )
		);
	}

	return (
		<Card className="woocommerce-product-variations">
			<div className="woocommerce-product-variations__header">
				<h4>{ __( 'Variation', 'woocommerce' ) }</h4>
				<h4>
					{ sprintf(
						/** Translators: The 3 letter currency code for the store. */
						__( 'Price (%s)', 'woocommerce' ),
						currencyConfig.code
					) }
				</h4>
				<h4>{ __( 'Quantity', 'woocommerce' ) }</h4>
			</div>
			<Sortable>
				{ variations.map( ( variation ) => (
					<ListItem key={ variation.id }>
						<div className="woocommerce-product-variations__attributes">
							{ variation.attributes.map( ( attribute ) => (
								/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
								/* @ts-ignore Additional props are not required. */
								<Tag
									id={ attribute.id }
									className="woocommerce-product-variations__attribute"
									key={ attribute.id }
									label={ attribute.option }
								/>
							) ) }
						</div>
						<div
							className={ classnames(
								'woocommerce-product-variations__price',
								{
									'woocommerce-product-variations__price--fade':
										variation.status === 'private',
								}
							) }
						>
							{ formatAmount( variation.price ) }
						</div>
						<div
							className={ classnames(
								'woocommerce-product-variations__quantity',
								{
									'woocommerce-product-variations__quantity--fade':
										variation.status === 'private',
								}
							) }
						>
							<span
								className={ classnames(
									'woocommerce-product-variations__status-dot',
									getProductStockStatusClass( variation )
								) }
							>
								●
							</span>
							{ getProductStockStatus( variation ) }
						</div>
						<div className="woocommerce-product-variations__actions">
							{ variation.status === 'private' && (
								<Tooltip
									position="top center"
									text={ NOT_VISIBLE_TEXT }
								>
									<Button
										className="components-button--hidden"
										aria-label={
											isUpdating[ variation.id ]
												? UPDATING_TEXT
												: NOT_VISIBLE_TEXT
										}
										aria-disabled={
											isUpdating[ variation.id ]
										}
										onClick={ () =>
											handleCustomerVisibilityClick(
												variation.id,
												'publish'
											)
										}
									>
										{ isUpdating[ variation.id ] ? (
											<Spinner />
										) : (
											<HiddenIcon />
										) }
									</Button>
								</Tooltip>
							) }

							{ variation.status === 'publish' && (
								<Tooltip
									position="top center"
									text={ VISIBLE_TEXT }
								>
									<Button
										className="components-button--visible"
										aria-label={
											isUpdating[ variation.id ]
												? UPDATING_TEXT
												: VISIBLE_TEXT
										}
										aria-disabled={
											isUpdating[ variation.id ]
										}
										onClick={ () =>
											handleCustomerVisibilityClick(
												variation.id,
												'private'
											)
										}
									>
										{ isUpdating[ variation.id ] ? (
											<Spinner />
										) : (
											<VisibleIcon />
										) }
									</Button>
								</Tooltip>
							) }
						</div>
					</ListItem>
				) ) }
			</Sortable>

			<Pagination
				className="woocommerce-product-variations__footer"
				page={ currentPage }
				perPage={ perPage }
				total={ totalCount }
				showPagePicker={ false }
				onPageChange={ setCurrentPage }
				onPerPageChange={ setPerPage }
			/>
		</Card>
	);
};
