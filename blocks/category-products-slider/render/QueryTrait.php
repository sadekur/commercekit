<?php
trait CslQueryTrait {

    private function get_terms(): ?array {
        $cat_type = $this->a['categoryType'] ?? 'parent';
        return $cat_type === 'all' ? $this->get_terms_all() : $this->get_terms_parent();
    }

    private function get_terms_parent(): ?array {
        $a    = $this->a;
        $args = [
            'taxonomy'   => 'product_cat',
            'hide_empty' => ! empty( $a['hideEmpty'] ),
            'number'     => max( 1, intval( $a['totalCategories'] ?? 12 ) ),
            'parent'     => 0,
        ];

        if ( empty( $a['randomize'] ) ) {
            $args['orderby'] = $a['orderBy'] ?? 'name';
            $args['order']   = $a['order']   ?? 'ASC';
        }

        if ( ( $a['filterType'] ?? '' ) === 'specific' && ! empty( $a['specificCategories'] ) ) {
            $ids = array_map( 'intval', array_filter( array_map( 'trim', explode( ',', $a['specificCategories'] ) ) ) );
            if ( $ids ) { $args['include'] = $ids; unset( $args['number'] ); }
        }

        $excl = $this->default_cat_exclude();
        if ( $excl ) $args['exclude'] = $excl;

        $terms = get_terms( $args );
        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            $this->no_cats_notice(); return null;
        }
        if ( ! empty( $a['randomize'] ) ) shuffle( $terms );
        if ( ! empty( $a['hideCatWithoutThumb'] ) ) {
            $terms = array_values( array_filter( $terms, fn( $t ) => get_term_meta( $t->term_id, 'thumbnail_id', true ) ) );
            if ( empty( $terms ) ) { $this->no_cats_notice(); return null; }
        }
        return $terms;
    }

    private function get_terms_all(): ?array {
        $a = $this->a;

        $all_raw = get_terms( [
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'number'     => 0,
            'exclude'    => $this->default_cat_exclude(),
        ] );
        if ( is_wp_error( $all_raw ) || empty( $all_raw ) ) { $this->no_cats_notice(); return null; }

        $term_map = [];
        foreach ( $all_raw as $t ) $term_map[ $t->term_id ] = $t;

        $terms = $all_raw;

        $pc = trim( $a['parentChildCategories'] ?? '' );
        if ( $pc !== '' ) {
            $sel_ids     = array_filter( array_map( 'intval', explode( ',', $pc ) ) );
            $allowed_ids = [];
            foreach ( $sel_ids as $id ) $this->collect_descendants( $id, $term_map, $allowed_ids );
            $terms = array_filter( $terms, fn( $t ) => in_array( $t->term_id, $allowed_ids, true ) );
        }

        if ( ! empty( $a['hideEmpty'] ) ) {
            $terms = array_filter( $terms, fn( $t ) => $t->count > 0 );
        }

        $ex_p  = ! empty( $a['excludeParent'] );
        $ex_c  = ! empty( $a['excludeChild'] );
        $ex_gc = ! empty( $a['excludeGrandChild'] );
        $ex_gg = ! empty( $a['excludeGreatGrandChild'] );
        if ( $ex_p || $ex_c || $ex_gc || $ex_gg ) {
            $terms = array_filter( $terms, function ( $t ) use ( $term_map, $ex_p, $ex_c, $ex_gc, $ex_gg ) {
                $d = $this->term_depth( $t->term_id, $term_map );
                if ( $ex_p  && $d === 0 ) return false;
                if ( $ex_c  && $d === 1 ) return false;
                if ( $ex_gc && $d === 2 ) return false;
                if ( $ex_gg && $d >= 3  ) return false;
                return true;
            } );
        }

        if ( ! empty( $a['hideCatWithoutThumb'] ) ) {
            $terms = array_filter( $terms, fn( $t ) => get_term_meta( $t->term_id, 'thumbnail_id', true ) );
        }

        $terms = array_values( $terms );
        if ( empty( $terms ) ) { $this->no_cats_notice(); return null; }

        if ( ! empty( $a['randomize'] ) ) {
            shuffle( $terms );
        } else {
            $ob  = $a['orderBy'] ?? 'name';
            $ord = strtoupper( $a['order'] ?? 'ASC' ) === 'DESC' ? -1 : 1;
            usort( $terms, function ( $a, $b ) use ( $ob, $ord ) {
                switch ( $ob ) {
                    case 'count':   $cmp = $a->count   - $b->count;   break;
                    case 'id':
                    case 'term_id': $cmp = $a->term_id - $b->term_id; break;
                    default:        $cmp = strcmp( $a->name, $b->name ); break;
                }
                return $ord * $cmp;
            } );
        }

        $total = max( 1, intval( $a['totalCategories'] ?? 12 ) );
        return array_slice( $terms, 0, $total );
    }

    private function get_term_groups(): ?array {
        $a = $this->a;

        $all_raw = get_terms( [
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'number'     => 0,
            'exclude'    => $this->default_cat_exclude(),
        ] );
        if ( is_wp_error( $all_raw ) || empty( $all_raw ) ) { $this->no_cats_notice(); return null; }

        $term_map = [];
        foreach ( $all_raw as $t ) $term_map[ $t->term_id ] = $t;

        $pc = trim( $a['parentChildCategories'] ?? '' );
        if ( $pc !== '' ) {
            $parent_ids = array_filter( array_map( 'intval', explode( ',', $pc ) ) );
        } else {
            $parent_ids = array_map(
                fn( $t ) => $t->term_id,
                array_filter( $all_raw, fn( $t ) => (int) $t->parent === 0 )
            );
        }

        $ex_p = ! empty( $a['excludeParent'] );
        $ex_c = ! empty( $a['excludeChild'] );

        $groups = [];
        foreach ( $parent_ids as $pid ) {
            if ( ! isset( $term_map[ $pid ] ) ) continue;
            $parent = $term_map[ $pid ];
            if ( ! empty( $a['hideEmpty'] ) && $parent->count === 0 ) continue;
            if ( ! empty( $a['hideCatWithoutThumb'] ) && ! get_term_meta( $pid, 'thumbnail_id', true ) ) continue;

            $children = [];
            if ( ! $ex_c ) {
                foreach ( $term_map as $t ) {
                    if ( (int) $t->parent !== $pid ) continue;
                    if ( ! empty( $a['hideEmpty'] ) && $t->count === 0 ) continue;
                    $children[] = $t;
                }
                usort( $children, fn( $a, $b ) => strcmp( $a->name, $b->name ) );
            }

            if ( ! $ex_p || $children ) {
                $groups[] = [ 'parent' => $ex_p ? null : $parent, 'children' => $children ];
            }
        }

        if ( empty( $groups ) ) { $this->no_cats_notice(); return null; }

        $total = max( 1, intval( $a['totalCategories'] ?? 12 ) );
        return array_slice( $groups, 0, $total );
    }

    private function collect_descendants( int $id, array $term_map, array &$result ): void {
        $result[] = $id;
        foreach ( $term_map as $t ) {
            if ( (int) $t->parent === $id ) {
                $this->collect_descendants( $t->term_id, $term_map, $result );
            }
        }
    }

    private function term_depth( int $term_id, array $term_map, int $depth = 0 ): int {
        if ( $depth > 10 || ! isset( $term_map[ $term_id ] ) ) return $depth;
        $parent = (int) $term_map[ $term_id ]->parent;
        return $parent === 0 ? $depth : $this->term_depth( $parent, $term_map, $depth + 1 );
    }

    private function default_cat_exclude(): array {
        $id = (int) get_option( 'default_product_cat', 0 );
        return $id > 0 ? [ $id ] : [];
    }

    private function no_cats_notice(): void {
        echo '<p class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">'
            . esc_html__( 'No product categories found.', 'commerce-kit' ) . '</p>';
    }
}
