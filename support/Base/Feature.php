<?php
namespace CommerceKit\Commerce\Support\Base;

use CommerceKit\Commerce\Support\Trait\Hookable;

abstract class Feature {
    use Hookable;
    protected array $settings = [];
}
